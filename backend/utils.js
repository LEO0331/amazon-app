import jwt from 'jsonwebtoken'; //https://www.npmjs.com/package/jsonwebtoken

export const generateToken = user => { //https://github.com/auth0/express-jwt
    return jwt.sign( //jwt.sign(payload, secretOrPrivateKey, [options, callback])
        {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
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
}

export const isAdmin = (req, res, next) => {
    if(req.user && req.user.isAdmin){
        next();
    } else {
        res.status(401).send({ message: 'Invalid Admin Token' });
    }
}
