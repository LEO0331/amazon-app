import jwt from 'jsonwebtoken'; //https://www.npmjs.com/package/jsonwebtoken

export const generateToken = user => {
    return jwt.sign( //jwt.sign(payload, secretOrPrivateKey, [options, callback])
        {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        }, process.env.JWT_SECRET || 'secret', {expiresIn: '90d',}
    );
};
