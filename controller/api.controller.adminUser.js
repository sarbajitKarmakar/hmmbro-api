 import { 
    getAllUsersQuery, 
    getSpecificUserQuery,
    deleteUserQuery,
} from '../model/db.js';


const getAllUser = async (req, res) => {
    try {
        const limit = req.body.limit || 30; // default limit to 100 if not provided
        const allUser = await getAllUsersQuery(limit);
        // console.log(allUser);

        return res.json(allUser);
    } catch (error) {
        return res.status(500).json("Error fetching users , " + error);
    }
}

const getSpecificUser = async (req, res) => {
    const id = req.params.id;

    try {
        const userDetails = await getSpecificUserQuery(id);
        return res.json(userDetails);
    } catch (error) {
        return res.status(500).json("Error fetching users , " + error);
    }
}

const deleteUser = async (req, res) => {
    const id = req.params.id;
    try {
        await deleteUserQuery(id);
        return  res.json({ message: "User deleted successfully" });
    }catch (error) {
        return res.status(500).json("Error deleting user , " + error);
    }
}

export {
    getAllUser,
    getSpecificUser,
    deleteUser
}