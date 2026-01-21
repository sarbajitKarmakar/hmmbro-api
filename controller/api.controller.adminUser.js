import {
    getAllUsersQuery,
    deleteUserQuery,
    searchUserQuery
} from '../model/db.js';

const searchUser = async (req, res) => {
    // console.log("not here")
    if (!req.query.value) return res.status(400).json({ message: "Please Sent any value in query to search" })
    const value = req.query.value
        .toString()
        .trim()// remove all unicode leading spaces
        .replace(/^["']|["']$/g, ""); //removing unwanted ""

    const limit = Number(req.query.limit) || 30;
    const page = Number(req.query.page) || 1;
    const offset = (page - 1) * limit;
    // console.log(value);
    if (value.length === 0) return res.status(400).json({ message: "Search value cannot be empty" });
    if (limit <= 0 || isNaN(limit)) return res.status(400).json({ message: "Limit must be a positive number" });
    if (page <= 0 || isNaN(page)) return res.status(400).json({ message: "Page must be a positive number" });
    if (offset < 0 || isNaN(offset)) return res.status(400).json({ message: "Offset must be a positive number" });
    if (!isNaN(Number(value)) && Number(value) <= 0) return res.status(400).json({ message: "If search value is number, it must be a positive number" });
    
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



const getAllUser = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 30; // default limit to 100 if not provided
        const page = Number(req.query.page) || 1; // default page to 1 if not provided
        const offset = (page - 1) * limit;
        const allUser = await getAllUsersQuery(limit, offset);
        const pageCount = Math.ceil(Number(allUser.total_count) / limit);
       
        // console.log(pageCount);

        return res.status(200).json({
            data: allUser.res,
            paginationModel:{
                currentpage: page,
                pageCount:pageCount,
                totalRecords: Number(allUser.total_count),
                perPage: limit
            }
        });
    } catch (error) {
        return res.status(500).json("Error fetching users , " + error);
    }
}

const deleteUser = async (req, res) => {
    const id = req.params.id;
    // console.log("deleteUser");
    if (!id) return res.status(400).json({ message: "User id is required" });
    if (isNaN(Number(id))) return res.status(400).json({ message: "User id must be a number" });
    if (Number(id) <= 0) return res.status(400).json({ message: "User id must be a positive number" });
    if (Number(id) === Number(req.user.id)) return res.status(400).json({ message: "You cannot delete your own account" });
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Only admin can delete user" });

    try {
        const deletedUser = await deleteUserQuery(id);
        if (!deletedUser) return res.status(404).json({ message: "User not found" });
        return res.json({ message: "User deleted successfully", deletedUser });
    } catch (error) {
        return res.status(500).json("Error deleting user , " + error);
    }
}



export {
    getAllUser,
    deleteUser,
    searchUser
}