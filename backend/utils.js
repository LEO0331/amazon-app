import jwt from 'jsonwebtoken';
import crypto from 'crypto';

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
  const token = req.cookies?.[COOKIE_NAME];

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
