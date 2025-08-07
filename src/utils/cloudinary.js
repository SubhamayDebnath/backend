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

const uploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) return null;
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto"
        });
        if (!response) return null;
        await fs.unlink(filePath);
        return response;
    } catch (error) {
        await fs.unlink(filePath); // delete the file from server if upload fails
        return null;
    }
}

export default uploadOnCloudinary;