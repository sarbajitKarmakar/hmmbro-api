 import { 
    getAllUsersQuery, 
    getSpecificUserQuery,
    deleteUserQuery,
} from '../model/db.js';


const getAllUser = async (req, res) => {
    try {
        const limit = req.query.limit || 30; // default limit to 100 if not provided
        const page = req.query.page || 1; // default page to 1 if not provided
        const offset = (page -1)*limit;
        const allUser = await getAllUsersQuery(limit,offset);
        const pageCount = Math.ceil(allUser[0].total_count / limit)
        // console.log(allUser);

        return res.status(200).json({
            page,
            pageCount,
            data:allUser
        });
    } catch (error) {
        return res.status(500).json("Error fetching users , " + error);
    }
}

const getSpecificUser = async (req, res) => {
    const id = req.params.id;

    try {
        const userDetails = await getSpecificUserQuery(id);
        if (!userDetails) return res.status(404).json({ message: "User not found" });
        return res.status(200).json({message:"User Details Updated",userDetails});
    } catch (error) {
        return res.status(500).json("Error fetching users , " + error);
    }
}

const deleteUser = async (req, res) => {
    const id = req.params.id;
    try {
        const deletedUser = await deleteUserQuery(id);
        if (!deletedUser) return res.status(404).json({ message: "User not found" });
        return  res.json({ message: "User deleted successfully" , deletedUser});
    }catch (error) {
        return res.status(500).json("Error deleting user , " + error);
    }
}

export {
    getAllUser,
    getSpecificUser,
    deleteUser
}