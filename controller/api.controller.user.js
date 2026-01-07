import {
    updateUserQuery,
} from '../model/db.js';




const specificUpdateUser = async (req, res) => {
    // console.log(req.body.role);
    const targetId = req.params.id;
    const USER__UPDATABLE_FEILDS = [
        'username',
        'email',
        'phone',
        'pic',
    ];

    if (req.body.password) return res.status(403).json({ message: "Password change is not allowed from this endpoint" });

    if (req.body.role) return res.status(403).json({ message: "Don't have permission to change the role" });

    if (req.body.id) return res.status(403).json({ message: "User ID cannot be changed" });

    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Please provide fields to update" });
    }

    if (parseInt(req.user.id) !== parseInt(targetId) && req.user.role !== 'admin') {
        return res.status(403).json({ message: "You can only update your own profile" });
    }

    const field = Object.keys(req.body).filter(key => USER__UPDATABLE_FEILDS.includes(key));
    const setClauses = field.map((key, i) => (
        `${key} = $${i + 1}`
    )).join(", ");
    const value = field.map(key => req.body[key]);

    try {
        const updatedUser = await updateUserQuery(targetId, setClauses, value);
        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        return res.status(200).json({ message: "Updated Successfully", updatedUser });
    } catch (error) {
        return res.status(500).json("Error updating user , " + error);
    }
}



export {
    specificUpdateUser,
};