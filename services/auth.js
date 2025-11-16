import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'your_jwt_secret';

const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        pic: user.pic,
        role: user.role,
        active: user.active,
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