import {
    getAllUsersQuery,
    deleteUserQuery,
    searchUserQuery
} from '../model/db.js';


const getAllUser = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 30; // default limit to 100 if not provided
        const page = Number(req.query.page) || 1; // default page to 1 if not provided
        const offset = (page - 1) * limit;
        const allUser = await getAllUsersQuery(limit, offset);
        const pageCount = Math.ceil(Number(allUser.total_count) / limit);
       
        // console.log(pageCount);

        return res.status(200).json({
            page,
            pageCount:pageCount,
            data: allUser.res
        });
    } catch (error) {
        return res.status(500).json("Error fetching users , " + error);
    }
}

const deleteUser = async (req, res) => {
    const id = req.params.id;
    // console.log("deleteUser");
    
    try {
        const deletedUser = await deleteUserQuery(id);
        if (!deletedUser) return res.status(404).json({ message: "User not found" });
        return res.json({ message: "User deleted successfully", deletedUser });
    } catch (error) {
        return res.status(500).json("Error deleting user , " + error);
    }
}

const searchUser = async (req, res) => {
    if (!req.query.value) return res.status(400).json({ message: "Please Sent any value in query to search" })
    const value = req.query.value
        .toString()
        .trim()// remove all unicode leading spaces
        .replace(/^["']|["']$/g, ""); //removing unwanted ""

    const limit = Number(req.query.limit) || 30;
    const page = Number(req.query.page) || 1;
    const offset = (page - 1) * limit;
    // console.log(value);
    
    try {
        const searchedVaule = await searchUserQuery(value, limit, offset);
        if (searchedVaule.length === 0) return res.status(404).json({ message: "No user found" });
        const pageCount = Math.ceil(Number(searchedVaule[0].total_count) / limit);
        res.status(200).json({page,pageCount,searchedVaule})
    } catch (error) {
        // console.log(`Error occure in search user :- ${error}`);
        return res.status(500).json("Error in search user: " + error);
    }
}

export {
    getAllUser,
    deleteUser,
    searchUser
}