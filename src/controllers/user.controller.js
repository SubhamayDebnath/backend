import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import AppError from "../utils/appError.js";
import User from "../models/user.model.js";
import Video from "../models/video.model.js";

// user details
const user = asyncHandler(async (req, res) => {
    const userID = req.user._id;
    const user = await User.findById(userID);
    if(!user){
        throw new AppError(404, "User not found");
    }
    return res.status(200).json(new ApiResponse(200, "User fetched successfully", user));
});

// user watchlist

const userWatchList = asyncHandler(async (req,res) => {
    const userID = req.user._id;
    const user = await User.findById(userID);
    if(!user){
        throw new AppError(404, "User not found");
    }
    const userWatchList = user.watchHistory;
    const videos=[];
    for(const videoID of userWatchList){
        const video = await Video.findById(videoID);
        if(video){
            videos.push(video);
        }
    }
    return res.status(200).json(new ApiResponse(200, "User fetched successfully", videos));
})

export {user,userWatchList};