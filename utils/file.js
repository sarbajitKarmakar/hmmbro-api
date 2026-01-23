import { unlink } from 'node:fs';


export const deleteLocalFile  = async (path) => {
    unlink(path, (err) => {
        if(err)
            console.error("Failed to delete local file:", err.message);
    });
}