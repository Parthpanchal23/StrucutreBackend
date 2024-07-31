import { v2 as cloudinary } from "cloudinary"
import fs from 'fs'

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});


// Upload an image

const uploadOnCloudinary = async (localeFilePath) => {
    try {
        if (!localeFilePath) return null
        // upload file on cloudinary
        const Response = await cloudinary.uploader
            .upload(
                localeFilePath, {
                resource_type: "auto"
            });
        console.log("file is uploaded in cloudinary", Response.url, Response);
        return Response;
    } catch (error) {
        //remove thw locally saved temp file as the upload operation failed
        fs.unlinkSync(localeFilePath);
    }
}

export { uploadOnCloudinary };