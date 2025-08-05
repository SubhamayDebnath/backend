import asyncHandler from "../utils/asyncHandler.js";
import Category from "../models/category.model.js"
import AppError from "../utils/appError.js";

// get all category
const getCategory = asyncHandler(async (req,res) => {
    const {categoryName}= req.body;    
    if(!categoryName){
        throw new AppError(400,"Category name is required");
    }
    const existingCategory = await Category.findOne({categoryName});
    if(existingCategory){
        throw new AppError(400,"Category name is already exist");
    }
})

export {getCategory}