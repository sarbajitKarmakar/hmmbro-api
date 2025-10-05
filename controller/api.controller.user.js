import pool from '../model/connection.js';

const createUser = async(req, res) => {
    const { username, email, password, phone, pic } = req.body;
    try {
        const data = await pool.query('INSERT INTO users (username, email, password,phone, pic) VALUES ($1, $2, $3, $4, $5)', [username, email, password, phone, pic]);
        return res.json("User created successfully , " + data);
    } catch (error) {
        console.log(error);
        
        return res.status(500).json("Error creating user , " + error);
    }
}

const getUser = async(req, res) => {
    const { username, email, password, phone, pic } = req.body;
    try {
        const data = await pool.query('INSERT INTO users (username, email, password,phone, pic) VALUES ($1, $2, $3, $4, $5)', [username, email, password, phone, pic]);
        return res.json("User created successfully , " + data);
    } catch (error) {
        console.log(error);
        
        return res.status(500).json("Error creating user , " + error);
    }
}

export { 
    createUser,
 };