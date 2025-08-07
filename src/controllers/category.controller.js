import asyncHandler from "../utils/asyncHandler.js";
import Category from "../models/category.model.js"
import AppError from "../utils/appError.js";
import ApiResponse from "../utils/apiResponse.js";

// get all category
const getCategory = asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ createdAt: -1 });
    if (!categories || categories.length === 0) {
        return res.status(404).json(new AppError(404, "Categories not found"));
    } else {
        return res.status(200).json(new ApiResponse(200, "Categories fetched successfully", categories));
    }
});

// add category
const addCategory = asyncHandler(async (req, res) => {
    const { categoryName } = req.body;
    if (!categoryName) {
        throw new AppError(400, "Category name is required");
    }
    const checkExistingCategory = await Category.findOne({ categoryName });
    if (checkExistingCategory) {
        throw new AppError(409, "Category already exists");
    }
    const category = await Category.create({
        categoryName: categoryName,
        owner: req.user._id
    })
    if (!category) {
        throw new AppError(500, "Something went wrong while adding category");
    }
    return res.status(201).json(new ApiResponse(201, "Category added successfully"));
});

// update category
const updateCategory = asyncHandler(async (req, res) => {
    const { categoryName } = req.body;
    if (!categoryName) {
        throw new AppError(400, "Category name is required");
    }
    const checkExistingCategory = await Category.findOne({ categoryName });
    if (checkExistingCategory) {
        throw new AppError(409, "Both New and Old category name should be different");
    }
    const category = await Category.findById(req.params.id);
    if (!category) {
        throw new AppError(404, "Category not found");
    }
    category.categoryName = categoryName;
    await category.save();
    return res.status(200).json(new ApiResponse(200, "Category updated successfully"));
});

// delete Category
const deleteCategory = asyncHandler(async (req, res) => {
    const category = req.params.id;
    if (!category) {
        throw new AppError(404, "Category not found");
    }
    await Category.findByIdAndDelete(category);
    return res.status(200).json(new ApiResponse(200, "Category deleted successfully"));
});

export { getCategory, addCategory, deleteCategory, updateCategory };