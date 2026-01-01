import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'your_jwt_secret';

const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
    }

    return jwt.sign(payload, secret);

}

const verifyToken =  (token) => {
    try {
        const verify = jwt.verify(token, secret);
        // console.log(verify);
        
        return verify;
    } catch (err) {
        console.log("verification failed . err:- " + err);
        
        return null;
    }
}

export { generateToken,verifyToken };