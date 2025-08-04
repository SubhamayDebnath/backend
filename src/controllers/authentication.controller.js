import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";
import ApiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import { isValidEmail } from "../utils/helper.js";

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
    if(!createdUser){
        throw new AppError(500,"Something went wrong while registering user");
    }
    return res.status(201).json(
        new ApiResponse(201,"User registered successfully",createdUser)
    );
});

export { registerUser };