import User from "../models/user.model.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

// get decode token
const decodeToke = async (req) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new AppError(401, "Unauthorized");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?.userId);
    return user
}
// verify jwt
const verifyJwtToken = asyncHandler(async function (req, res, next) {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new AppError(401, "Unauthorized");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?.userId);
        if (!user) {
            throw new AppError(401, "Unauthorized, Invalid token");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new AppError(401, error.message || "Unauthorized, Invalid token");
    }
});

// check user is admin or not
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        throw new AppError(403, "Forbidden: You do not have permission to access this resource");
    }
};
export { verifyJwtToken ,isAdmin};