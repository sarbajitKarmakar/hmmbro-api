import { v2 as cloudinary } from "cloudinary";
import { deleteLocalFile } from "../utils/file.js";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
export const uploadImage = async (filePath, folder) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: "image",
    folder: "products",
    quality: "auto",
  });
  await deleteLocalFile(filePath);

  if (!result.secure_url || !result.public_id) {
    throw new Error("Cloudinary upload failed");
  }


  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

// Generate image URL from public_id (rare case)
export const getImageUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    ...options,
  });
};

// Delete image using public_id
export const deleteImage = async (publicId) => {
  const result = await cloudinary.uploader.destroy(publicId);

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error("Failed to delete image");
  }

  return true;
};
