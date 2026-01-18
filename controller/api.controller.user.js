import {
    updateUserQuery,
    findUserByUserIdQuery,
    findUserByEmailQuery,
} from '../model/db.js';

import {
    uploadImage,
    deleteImage,
} from '../services/cloudenary.sevice.js'

import {
    USER__UPDATABLE_FEILDS,
} from '../constants/user.constants.js'

import {
    deleteLocalFile,
} from '../utils/file.js'


const specificUpdateUser = async (req, res) => {
    // console.log(req.body.role);
    const targetId = req.params.id ? req.params.id : req.user.id;
    let result, getUser;

    // 
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

    if (field.length === 0) {
        return res.status(400).json({ message: "No updatable fields provided" });
    }
    // console.log(field);
    const setClauses = field.map((key, i) => (
        `${key} = $${i + 1}`
    ));


    // console.log('trouble here');

    const value = field.map(key => req.body[key]);


    try {
        
        // if() thiss need to changee here (optimize the and reduce multiple time upload image on cloudenary)
        
        if (req.file) {
                getUser = await findUserByUserIdQuery(targetId);
                if (!getUser) {
                    return res.status(404).json({ message: "User not found" });
                }

            if (req.body.email) {
                const existingEmailUser = await findUserByEmailQuery(req.body.email);
                if (existingEmailUser && parseInt(existingEmailUser.id) !== parseInt(targetId)) {
                    return res.status(409).json({ message: "Email already exists" });
                }
            }
            result = await uploadImage(req.file.path, "Avatars");
            // console.log('not here');
            setClauses.push(`avatar = $${setClauses.length + 1}`);
            setClauses.push(`avatar_id = $${setClauses.length + 1}`);
            
            value.push(result.url, result.publicId);
        }
        setClauses.push(`updated_at = NOW()`);
        const updatedUser = await updateUserQuery(targetId, setClauses, value);
        
        // console.log(getUser.avatar_id)
        if(getUser)await deleteImage(getUser.avatar_id);
        // console.log('not here')
        // if (req.file) await deleteLocalFile(req.file.path);
        return res.status(200).json({ message: "Updated Successfully", updatedUser });
    } catch (error) {
        if (error.code === "23505") {
            // console.log(error.constraint);
            if (error.constraint === "email") {
                return res.status(409).json({ message: "Email already exists" });
            }
            if (error.constraint === "phone") {
                return res.status(409).json({ message: "Phone no already exists" });
            }
        }
        if(result) await deleteImage(result.publicId);
        return res.status(500).json("Error updating user , " + error);
    }
}



export {
    specificUpdateUser,
};