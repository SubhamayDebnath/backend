import Video from "../models/video.model.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/apiResponse.js";

// add video
const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description, category } = req.body;
    // local paths
    const videoFileLocalPath = req.files?.file[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!videoFileLocalPath) {
        throw new AppError(400, "Video file is required");
    }
    if (!thumbnailLocalPath) {
        throw new AppError(400, "Thumbnail is required");
    }
    // upload on cloudinary
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!videoFile || !thumbnail) {
        throw new AppError(500, "Something went wrong while uploading video", null);
    }
    if ([title, description, category].some((field) => field?.trim() === "")) {
        throw new AppError(400, "Title, description and category is required");
    }
    // save into the database
    const uploaded = await Video.create({
        videoFile:{
            url: videoFile?.url || "",
            public_id: videoFile?.public_id || "",
        },
        thumbnail:{
            url: thumbnail?.url || "",
            public_id: thumbnail?.public_id || "",
        },
        title,
        description,
        category,
        duration:videoFile?.duration,
        owner: req.user._id,
    });
    if (!uploaded) {
        throw new AppError(500, "Failed to upload video", null);
    }
    return res.status(200).json(new ApiResponse(200, "Video uploaded successfully"));
});

const deleteVideo = asyncHandler(async (req,res) => {
    const videoId = req.params.id;
    if(!videoId){
        throw new AppError(404,"Video not found");
    }
    const deletedVideo = await Video.findByIdAndDelete(videoId);
    if(!deletedVideo){
        throw new AppError(404,"Video not found");
    }
});

export { uploadVideo };