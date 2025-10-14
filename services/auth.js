import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'your_jwt_secret';

const generateToken = (user) => {
    const payload = {
        email: user.email,
        username: user.username,
        phone: user.phone,
        pic: user.pic,
        role: user.role,
        active: user.active,
    }

    return jwt.sign(payload, secret);

}

const verifyToken = (token) => {
    try {
        return jwt.verify(token, secret);
    } catch (err) {
        return null;
    }
}

export { generateToken,verifyToken };