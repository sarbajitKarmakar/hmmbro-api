import {
    searchUserQuery
} from '../model/db.js';


export const searchUserService = async (value, limit, offset) => {
    if (!value) throw new Error("Please Sent any value in body as value: to search");
    const cleanValue = value
        .toString()
        .trim()// remove all unicode leading spaces
        .replace(/^["']|["']$/g, ""); //removing unwanted ""

    // console.log(cleanValue);
    
    
    try {
        const searchedVaule = await searchUserQuery(cleanValue, limit, offset);
        if (searchedVaule.res.length === 0) throw new Error("No user found");
        
        console.log(searchedVaule);
        return searchedVaule;
    } catch (error) {
        // console.log(`Error occure in search user :- ${error}`);
        // console.log(error)
        throw error;
    }
}