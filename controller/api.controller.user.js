import { 
    insertNewUserQuery, 
    findUserByUsernameQuery, 
    updateUserQuery,
} from '../model/db.js';

import { generateToken } from '../services/auth.js';

import { 
    hashPassword, 
    verifyPassword 
} from '../services/hashPass.js';

const createUser = async (req, res) => {
    const { username, email, password, phone, pic } = req.body;
    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
        return res.status(500).json("Error hashing password");
    }
    try {
        const data = await insertNewUserQuery(username, email, hashedPassword, phone, pic);
        return res.status(201).json({message:"User created successfully ", data});
    } catch (error) {
        // console.log(error);
        return res.status(500).json("Error creating user , " + error);
    }
}

const getUser = async (req, res) => {
    const email = req.body.email.trim().toLowerCase();
    try {
        const user = await findUserByUsernameQuery(email);
        if(!user.active) return res.status(403).json({ message: "This account is deactivated" });
        
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

const specificUpdateUser = async (req, res) => {
    // console.log(req.body.role);
    
    if(req.body.password) return res.status(403).json({ message: "Password change is not allowed from this endpoint" });
    if(req.body.role && req.user.role !== 'admin') return res.status(403).json({ message: "Don't have permission to change the role" });
    const feild = [];
    const value = [];
    let index = 1;
    const id = req.user.id;

    for (const key in req.body) {
        if (key === 'id') continue;
        feild.push(`${key} = $${index}`);
        value.push(req.body[key]);
        index++;
    }
    // console.log(feild,value);
    
    try {
        const updatedUser = await updateUserQuery(id, feild, value);
        if(!updatedUser) return res.status(404).json({ message: "User not found" });
        
        return res.status(200).json({message: "Updated",updatedUser});
    } catch (error) {
        return res.status(500).json("Error updating user , " + error);
    }
}



export {
    createUser,
    getUser,
    specificUpdateUser,
};