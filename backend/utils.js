import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import mg from 'mailgun-js';

const COOKIE_NAME = 'auth_token';
const CSRF_COOKIE = 'csrf_token';
const TOKEN_EXPIRES = '7d';

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

export function generateToken(user) {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
    },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES }
  );
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
  });
}

export function issueCsrfToken(res) {
  const token = crypto.randomBytes(24).toString('hex');
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: isProduction(),
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });
  return token;
}

export function csrfProtection(req, res, next) {
  const safeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  if (safeMethod) {
    return next();
  }

  const ignoredPaths = new Set([
    '/api/users/signin',
    '/api/users/register',
    '/api/users/signout',
  ]);

  if (ignoredPaths.has(req.path)) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).send({ message: 'CSRF token missing or invalid' });
  }

  return next();
}

export function isAuth(req, res, next) {
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  const token = req.cookies?.[COOKIE_NAME] || bearer;

  if (!token) {
    return res.status(401).send({ message: 'No Token' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
    if (err) {
      return res.status(401).send({ message: 'Invalid User Token' });
    }
    req.user = decode;
    return next();
  });
}

export function isAdmin(req, res, next) {
  if (req.user?.isAdmin) {
    return next();
  }
  return res.status(401).send({ message: 'Invalid Admin Token' });
}

export function isSeller(req, res, next) {
  if (req.user?.isSeller) {
    return next();
  }
  return res.status(401).send({ message: 'Invalid Seller Token' });
}

export function isAdminOrSeller(req, res, next) {
  if (req.user?.isAdmin || req.user?.isSeller) {
    return next();
  }
  return res.status(401).send({ message: 'Invalid Admin/Seller Token' });
}

export function mailgun() {
  return mg({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  });
}

export function payOrderEmailTemplate(order) {
  return `<h1>Thank you for shopping with us!</h1>
  <p>Hi ${order.user?.name || 'Customer'},</p>
  <p>Congratulations! We have finished processing your order.</p>
  <h2>[Order ${order._id}] (${new Date(order.createdAt).toISOString().substring(0, 10)})</h2>
  <table>
  <thead>
  <tr>
  <td><strong>Product</strong></td>
  <td><strong>Quantity</strong></td>
  <td><strong align="right">Price</strong></td>
  </tr>
  </thead>
  <tbody>
  ${(order.orderItems || [])
    .map(
      (item) => `
    <tr>
      <td>${item.name}</td>
      <td align="center">${item.qty}</td>
      <td align="right">$${Number(item.price).toFixed(2)}</td>
    </tr>`
    )
    .join('')}
  </tbody>
  </table>`;
}
