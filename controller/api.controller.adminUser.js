import {
    getAllUsersQuery,
    deleteUserQuery,
} from '../model/db.js';

import {
    searchUserService
} from '../services/adminUser.service.js';





const getAllUser = async (req, res) => {

    let allUser, pageCount;
    const value = req.query.value;
    const limit = Number(req.query.limit) || 30; // default limit to 100 if not provided
    const page = Number(req.query.page) || 1; // default page to 1 if not provided
    const offset = (page - 1) * limit;
    
    try {
        if (value) {

            if (limit <= 0 || isNaN(limit)) return res.status(400).json({ message: "Limit must be a positive number" });
            if (page <= 0 || isNaN(page)) return res.status(400).json({ message: "Page must be a positive number" });
            if (offset < 0 || isNaN(offset)) return res.status(400).json({ message: "Offset must be a positive number" });
            if (!isNaN(Number(value)) && Number(value) <= 0) return res.status(400).json({ message: "If search value is number, it must be a positive number" });

            allUser = await searchUserService(value, limit, offset);
            pageCount = Math.ceil(Number(allUser.total_count) / limit);


        }else{
            allUser = await getAllUsersQuery(limit, offset);
            pageCount = Math.ceil(Number(allUser.total_count) / limit);
        }

        



        return res.status(200).json({
            paginationModel: {
                currentpage: page,
                pageCount: pageCount,
                totalRecords: allUser.total_count,
                perPage: limit
            },
            data: allUser.res,
        });
    } catch (error) {
        console.log(error);
        if (error.message === "No user found") {
            return res.status(404).json({ message: "No user found" });
        }
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
    // searchUser
}