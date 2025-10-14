import {getAllUsersQuery, insertNewUserQuery, findUserByUsernameQuery} from '../model/db.js';

const getAllUser = async(req, res) =>{
    try {
        const allUser = await getAllUsersQuery();
        console.log(allUser);
        
        return res.json(allUser);
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
    const userName = req.query.username;
    try {
        const user = await findUserByUsernameQuery(userName);
        if(user){
            return res.json(user);
        }else{
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