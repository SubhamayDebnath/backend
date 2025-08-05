import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";
import ApiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import { isValidEmail, cookieOption } from "../utils/helper.js";

// generate access and refresh token
const generateAccessAndRefreshToken = async (userID) => {
    try {
        const user = await User.findById(userID);
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
    // to check user is created or not
    const createdUser = await User.findById(user._id);
    if (!createdUser) {
        throw new AppError(500, "Something went wrong while registering user");
    }
    return res.status(201).json(
        new ApiResponse(201, "User registered successfully", createdUser)
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
    const loggedInUser = await User.findById(user._id);
    return res.status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .json(
            new ApiResponse(200, "User logged in successfully", { id: loggedInUser._id, username: loggedInUser.username, email: loggedInUser.email, role: loggedInUser.role })
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

export { registerUser, loginUser, logoutUser };