import Video from "../models/video.model.js";
import Category from "../models/category.model.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";

// get all videos
const getAllVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find().sort({ createdAt: -1 }).populate("owner");
    if (!videos || videos.length === 0) {
        return res.status(200).json(new AppError(404, "Videos not found",[]));
    } else {
        return res.status(200).json(new ApiResponse(200, "Videos fetched successfully", videos));
    }
});

// get video by id
const getVideoById = asyncHandler(async (req, res) => {
    const videoId = req.params.id;
    if (!videoId) {
        throw new AppError(404, "Video not found");
    }
    const video = await Video.findById(videoId).populate("owner");
    if (!video) {
        throw new AppError(404, "Video not found");
    }
    return res.status(200).json(new ApiResponse(200, "Video fetched successfully", video));
});

// get video by category
const getVideoByCategory = asyncHandler(async (req,res) => {
    const categorySlug = req.params.slug;
    const categoryName = categorySlug.trim();
    if (!categoryName) {
        throw new AppError(404, "Category not found");
    }
    const category = await Category.findOne({categoryName:categoryName});
    if(!category){
        throw new AppError(404, "Invalid category");
    }
    const videos = await Video.find({ category: category._id }).populate("owner");
    if (!videos || videos.length === 0) {
        return res.status(200).json(new AppError(404, "Videos not found",[]));
    } else {
        return res.status(200).json(new ApiResponse(200, "Videos fetched successfully", videos));
    }
});

// get videos by user 
const getVideosByUser = asyncHandler(async (req,res) => {
    const userNameSlug = req.params.slug;
    if(!userNameSlug){
        throw new AppError(404, "User not found");
    }
    const userName = userNameSlug.trim();
    const user = await User.findOne({username:userName});
    const videos = await Video.find({ owner: user._id }).populate("owner");
    if (!videos || videos.length === 0) {
        return res.status(200).json(new AppError(404, "Videos not found",[]));
    } else {
        return res.status(200).json(new ApiResponse(200, "Videos fetched successfully", videos));
    }
});

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
    const [videoFile, thumbnail] = await Promise.all([
        uploadOnCloudinary(videoFileLocalPath, "video"),
        uploadOnCloudinary(thumbnailLocalPath, "image"),
    ])
    if (!videoFile || !thumbnail) {
        throw new AppError(500, "Something went wrong while uploading video", null);
    }
    if ([title, description, category].some((field) => field?.trim() === "")) {
        throw new AppError(400, "Title, description and category is required");
    }
    // save into the database
    const uploaded = await Video.create({
        videoFile: {
            url: videoFile?.url,
            public_id: videoFile?.public_id,
        },
        thumbnail: {
            url: thumbnail?.url,
            public_id: thumbnail?.public_id,
        },
        title,
        description,
        category,
        duration: videoFile?.duration,
        owner: req.user._id,
    });
    if (!uploaded) {
        throw new AppError(500, "Failed to upload video", null);
    }
    return res.status(200).json(new ApiResponse(200, "Video uploaded successfully"));
});

// update video
const updateVideo = asyncHandler(async (req, res) => {
    const updateObject = {};
    const videoID = req.params.id;
    if (!videoID) {
        throw new AppError(404, "Video not found");
    }
    const video = await Video.findById(videoID);
    if (!video) {
        throw new AppError(404, "Video not found");
    }
    const videoPublicId = video.videoFile?.public_id;
    const thumbnailPublicId = video.thumbnail?.public_id;

    const { title, description, category } = req.body;
    if ([title, description, category].some((field) => field?.trim() === "")) {
        throw new AppError(400, "Title, description and category is required");
    }
    if (title) updateObject.title = title;
    if (description) updateObject.description = description;
    if (category) updateObject.category = category;

    // if files are present then upload on cloudinary
    if (Object.keys(req.files).length > 0) {
        // it will check file mime type. based on that it will execute different code block
        if(req.files.file[0].mimetype.split("/")[0] === 'video'){
            const videoFileLocalPath = req.files?.file[0]?.path;
            const [uploadResults, deletionResults] = await Promise.all([
                uploadOnCloudinary(videoFileLocalPath, "video"),
                deleteFromCloudinary(videoPublicId, "video"),
            ])
            const videoFile = uploadResults;
            if (!videoFile) {
                throw new AppError(500, "Something went wrong while uploading video", null);
            }
            updateObject.videoFile = { url: videoFile?.url, public_id: videoFile?.public_id };
            updateObject.duration = videoFile?.duration;
        } else if (req.files.thumbnail[0].mimetype.split("/")[0] === 'image'){
            const thumbnailLocalPath = req.files?.thumbnail[0]?.path || null;
            const [uploadResults, deletionResults] = await Promise.all([
                uploadOnCloudinary(thumbnailLocalPath, "image"),
                deleteFromCloudinary(thumbnailPublicId, "image"),
            ])
            const thumbnail = uploadResults;
            if (!thumbnail) {
                throw new AppError(500, "Something went wrong while uploading thumbnail", null);
            }
            updateObject.thumbnail = { url: thumbnail?.url, public_id: thumbnail?.public_id };
        } else if( req.files.file[0].mimetype.split("/")[0] === 'video' && req.files.thumbnail[0].mimetype.split("/")[0] === 'image'){
            const videoFileLocalPath = req.files?.file[0]?.path;
            const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
            const [uploadResults, deletionResults] = await Promise.all([
                Promise.all([
                    uploadOnCloudinary(videoFileLocalPath, "video"),
                    uploadOnCloudinary(thumbnailLocalPath, "image"),
                ]),
                Promise.all([
                    deleteFromCloudinary(videoPublicId, "video"),
                    deleteFromCloudinary(thumbnailPublicId, "image"),
                ])
            ])
            updateObject.videoFile = { url: newVideoFile.url, public_id: newVideoFile.public_id };
            updateObject.thumbnail = { url: newThumbnail.url, public_id: newThumbnail.public_id };
            updateObject.duration = newVideoFile.duration;
        }
    }

    if (Object.keys(updateObject).length !== 0) {
        await Video.findByIdAndUpdate(
            videoID,
            { $set: updateObject },
            { new: true, runValidators: true }
        );
        return res.status(200).json(new ApiResponse(200, "Video updated successfully"));
    }
    return res.status(200).json(new ApiResponse(200, "Video not updated"));
});

// delete video
const deleteVideo = asyncHandler(async (req, res) => {
    const videoId = req.params.id;
    if (!videoId) {
        throw new AppError(404, "Video not found");
    }
    const deletedVideo = await Video.findById(videoId);
    if (!deletedVideo) {
        throw new AppError(404, "Video not found");
    }
    const thumbnailPublicId = deletedVideo.thumbnail?.public_id;
    const videoPublicId = deletedVideo.videoFile?.public_id;
    // delete from cloudinary
    const [videoDeletion, thumbnailDeletion] = await Promise.all([
        deleteFromCloudinary(videoPublicId, "video"),
        deleteFromCloudinary(thumbnailPublicId, "image")
    ]);
    if (!videoDeletion || !thumbnailDeletion) {
        throw new AppError(500, "Something went wrong while deleting video", null);
    }
    await Video.findByIdAndDelete(videoId);
    return res.status(200).json(new ApiResponse(200, "Video deleted successfully"));
});

export { getAllVideos, getVideoById,getVideosByUser,getVideoByCategory,uploadVideo, updateVideo, deleteVideo };