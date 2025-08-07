import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import fs from "fs/promises";

// configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// upload file on cloudinary
const uploadOnCloudinary = async (filePath, type) => {
    try {
        if (!filePath) return null;
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: type
        });
        if (!response) return null;
        await fs.unlink(filePath);
        return response;
    } catch (error) {
        await fs.unlink(filePath); // delete the file from server if upload fails
        return null;
    }
}
// delete file from cloudinary
const deleteFromCloudinary = async (publicId, type) => {
    try {
        if (!publicId) return null;
        // delete the file from cloudinary
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: type
        });
        if (!response) return null;
        return response;
    } catch (error) {
        console.error(error)
        return null;
    }
}

export { uploadOnCloudinary, deleteFromCloudinary };