import jwt from 'jsonwebtoken';

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'your-256-bit-secret';
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'your-512-bit-secret';

const generateAccessToken = (user) => {
    const payload = {
        id: user.id,
        role: user.role,
    }

    return jwt.sign(payload, accessTokenSecret, { expiresIn: '15m' });
}

const generateRefreshToken = (user) => {
    const payload = {
        id: user.id,
    }

    return jwt.sign(payload, refreshTokenSecret, { expiresIn: '7d' });

}

const verifyAccessToken =  (token) => {
    try {
        const verify = jwt.verify(token, accessTokenSecret);
        // console.log(verify);
        
        return verify;
    } catch (err) {
        console.log("verification failed . err:- " + err);
        
        return null;
    }
}

const verifyRefreshToken =  (token) => {
    try {
        const verify = jwt.verify(token, refreshTokenSecret);
        // console.log(verify);
        
        return verify;
    } catch (err) {
        console.log("verification failed . err:- " + err);
        
        return null;
    }
}

export { 
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
 };