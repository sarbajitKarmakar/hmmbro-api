import { getAllUsersQuery, insertNewUserQuery, findUserByUsernameQuery } from '../model/db.js';
import { generateToken } from '../services/auth.js';
import { hashPassword, verifyPassword } from '../services/hashPass.js';

const getAllUser = async (req, res) => {
    try {
        const allUser = await getAllUsersQuery();
        // console.log(allUser);

        return res.json(allUser);
    } catch (error) {
        return res.status(500).json("Error fetching users , " + error);
    }
}

const createUser = async (req, res) => {
    const { username, email, password, phone, pic } = req.body;
    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
        return res.status(500).json("Error hashing password");
    }
    try {
        const data = await insertNewUserQuery(username, email, hashedPassword, phone, pic);
        return res.json("User created successfully ");
    } catch (error) {
        // console.log(error);
        return res.status(500).json("Error creating user , " + error);
    }
}

const getUser = async (req, res) => {
    const email = req.body.email;
    try {
        const user = await findUserByUsernameQuery(email);
        if (user) {
            const isPasswordValid = await verifyPassword(req.body.password, user.password);
            if (!isPasswordValid) return res.status(401).json("Invalid password");
            const token = generateToken(user);
            return res.json(token);
        } else {
            return res.status(404).json("User not found");
        }

    } catch (error) {
        return res.status(500).json("Error fetching user , " + error);
    }

}

export {
    getAllUser,
    createUser,
    getUser,
};