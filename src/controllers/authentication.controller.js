import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";
import ApiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import { isValidEmail, cookieOption } from "../utils/helper.js";
import jwt from "jsonwebtoken";

// generate access and refresh token
const generateAccessAndRefreshToken = async (userID) => {
    try {
        const user = await User.findById(userID).select("+refreshToken");
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({
            validateBeforeSave: false
        });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new AppError(500, "Something went wrong while generating token");
    }
}

// register new user
const registerUser = asyncHandler(async (req, res) => {
    const { username, fullname, email, password } = req.body;
    if ([username, fullname, email, password].some((field) => field?.trim() === "")) {
        throw new AppError(400, "All fields are required");
    };
    // email validation
    if (!isValidEmail(email)) {
        throw new AppError(400, "Please provide a valid email");
    }
    // check if user already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    if (existedUser) {
        throw new AppError(409, "User already exists with this username or email");
    }
    const user = await User.create({
        username: username.toLowerCase(),
        fullname,
        email,
        password
    });
    if (!user) {
        throw new AppError(500, "Something went wrong while registering user");
    }
    return res.status(201).json(
        new ApiResponse(201, "User registered successfully",user)
    );
});

// login user
const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if (!password || (!username && !email)) {
        throw new AppError(400, "Password and either username or email are required");
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    }).select("+password");
    if (!user) {
        throw new AppError(401, "Invalid Credential");
    }
    // function to compare both plain text password with saved hashed password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
        throw new AppError(401, "Invalid Credential");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    return res.status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .json(
            new ApiResponse(200, "User logged in successfully", { id: user._id, username: user.username, email: user.email, role: user.role })
        );
});

// logout user
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user?._id,
        {
            $unset: { refreshToken: 1 }
        },
        {
            new: true
        }
    );
    return res.status(200)
        .clearCookie("accessToken", cookieOption)
        .clearCookie("refreshToken", cookieOption)
        .json(
            new ApiResponse(200, "User logged out successfully")
        );
});

// refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new AppError(401, "Unauthorized access");
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new AppError(401, "Unauthorized access");
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new AppError(401, "Token is expired or used");
        }
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);
        return res.status(200)
            .clearCookie("accessToken", accessToken, cookieOption)
            .clearCookie("refreshToken", newRefreshToken, cookieOption)
            .json(
                new ApiResponse(200, "Access token refreshed successfully", { accessToken, newRefreshToken })
            );
    } catch (error) {
        throw new AppError(401, error.message || "Unauthorized access");

    }
})

export { registerUser, loginUser, logoutUser, refreshAccessToken };