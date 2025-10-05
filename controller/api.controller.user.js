import pool, {getAllUsersQuery, insertNewUserQuery} from '../model/db.js';

const getAllUser = async(req, res) =>{
    try {
        const allUser = await getAllUsersQuery();
        return res.json(allUser.rows);
    } catch (error) {
        return res.status(500).json("Error fetching users , " + error);
    }
}

const createUser = async(req, res) => {
    const { username, email, password, phone, pic } = req.body;
    try {
        const data = await insertNewUserQuery(username, email, password, phone, pic);
        return res.json("User created successfully ");
    } catch (error) {
        console.log(error);
        
        return res.status(500).json("Error creating user , " + error);
    }
}

const getUser = async(req, res) => {
    
}

export { 
    getAllUser, 
    createUser,
    getUser,
 };