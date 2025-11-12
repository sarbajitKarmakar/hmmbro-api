import { 
    deactivateAccQuery,
    activateAccQuery
 } from '../model/db.js';

// using this controller for both admin and user deactivation
const deactivateAcc = async (req, res) =>{
    const id = req.params.id;
    // console.log(id, req.user.id);
    // console.log(req.user.role);
    // console.log(id != req.user.id , req.user.role !== 'admin');
    
    if (id != req.user.id && req.user.role !== 'admin') return res.status(403).json({message: "Unauthorized to deactive an account"})
    try {
        const update = await deactivateAccQuery(id);
        return res.status(200).json({message: 'Account Deactivated', update})
    } catch (error) {
        return res.status(500).json("Error deactivating user , " + error)
    }
}

// using this controller for both admin and user deactivation
const activateAcc = async (req, res) =>{
    const id = req.params.id;
    // console.log(id, req.user.id);
    // console.log(req.user.role);
    // console.log(id != req.user.id , req.user.role !== 'admin');
    
    if (id != req.user.id && req.user.role !== 'admin') return res.status(403).json({message: "Unauthorized to deactive an account"})
    try {
        const update = await activateAccQuery(id);
        return res.status(200).json({message: 'Account Activated',update})
    } catch (error) {
        return res.status(500).json("Error activating user , " + error)
    }
}

export{
    deactivateAcc,
    activateAcc
}