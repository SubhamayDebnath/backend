import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
})

const uploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) return null;
        // upload the file on cloudinary
        return await cloudinary.uploader.upload(filePath, {
            resource_type: "auto"
        });
    } catch (error) {
        fs.unlinkSync(filePath); // delete the file from server if upload fails
        return null;
    }
}

export default uploadOnCloudinary;