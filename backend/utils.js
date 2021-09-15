import jwt from 'jsonwebtoken'; //https://www.npmjs.com/package/jsonwebtoken
import mg from 'mailgun-js'; //https://www.npmjs.com/package/mailgun-js

export const generateToken = user => { //https://github.com/auth0/express-jwt
    return jwt.sign( //jwt.sign(payload, secretOrPrivateKey, [options, callback])
        {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            isSeller: user.isSeller,
        }, process.env.JWT_SECRET || 'secret', {expiresIn: '90d',}
    );
};

export const isAuth = (req, res, next) => { //middleware to authenticate users
    const authorization = req.headers.authorization; //https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization
    if (authorization){ //https://stackoverflow.com/questions/24000580/how-does-req-headers-authorization-get-set
        const token = authorization.slice(7, authorization.length); // format: Bearer XXXXXX; JWTs can be used as OAuth 2.0 Bearer Tokens to encode all relevant parts of an access token into the access token itself instead of having to store them in a database
        jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decode) => { //decrypt; callback 
            if (err) {
                res.status(401).send({ message: 'Invalid User Token' });
            } else {
                req.user = decode;
                next();
            }
            /*
            if (err) {
                return res.status(401).send({ message: 'Invalid Token' });
            } 
            req.user = decode;
            next(); //to next middleware
            */
        });
    } else {
        res.status(401).send({ message: 'No Token' });
    }
};

export const isAdmin = (req, res, next) => {
    if(req.user && req.user.isAdmin){
        next();
    } else {
        res.status(401).send({ message: 'Invalid Admin Token' });
    }
};

export const isSeller = (req, res, next) => {
    if(req.user && req.user.isSeller){
        next();
    } else {
        res.status(401).send({ message: 'Invalid Seller Token' });
    }
};

export const isAdminOrSeller = (req, res, next) => {
    if(req.user && (req.user.isAdmin || req.user.isSeller)){
        next();
    } else {
        res.status(401).send({ message: 'Invalid Admin/Seller Token' });
    }
};

export const mailgun = () => mg({ //const mg = mailgun({apiKey: api_key, domain: DOMAIN});
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
});

export const payOrderEmailTemplate = (order) => {
    return `<h1>Thank you for shopping with us!</h1>
    <p>Hi ${order.user.name},</p>
    <p>Congratulations! We have finished processing your order.</p>
    <h2>[Order ${order._id}] (${order.createdAt.toString().substring(0, 10)})</h2>
    <table>
    <thead>
    <tr>
    <td><strong>Product</strong></td>
    <td><strong>Quantity</strong></td>
    <td><strong align="right">Price</strong></td>
    </thead>
    <tbody>
    ${order.orderItems.map(item => `
      <tr>
      <td>${item.name}</td>
      <td align="center">${item.qty}</td>
      <td align="right"> $${item.price.toFixed(2)}</td>
      </tr>
    `
    ).join('\n')}
    </tbody>
    <tfoot>
    <tr>
    <td colspan="2">Items Price:</td>
    <td align="right"> $${order.itemsPrice.toFixed(2)}</td>
    </tr>
    <tr>
    <td colspan="2">Tax Price:</td>
    <td align="right"> $${order.taxPrice.toFixed(2)}</td>
    </tr>
    <tr>
    <td colspan="2">Shipping Price:</td>
    <td align="right"> $${order.shippingPrice.toFixed(2)}</td>
    </tr>
    <tr>
    <td colspan="2"><strong>Total Price:</strong></td>
    <td align="right"><strong> $${order.totalPrice.toFixed(2)}</strong></td>
    </tr>
    <tr>
    <td colspan="2">Payment Method:</td>
    <td align="right">${order.paymentMethod}</td>
    </tr>
    </table>
    <h2>Shipping Address</h2>
    <p>
    ${order.shippingAddress.fullName},<br/>
    ${order.shippingAddress.address},<br/>
    ${order.shippingAddress.city},<br/>
    ${order.shippingAddress.postalCode},<br/>
    ${order.shippingAddress.country}<br/>
    </p>
    <hr/>
    <p>
    Thanks for shopping with us!
    </p>
    `;
};
