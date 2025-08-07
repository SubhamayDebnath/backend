import { Router } from "express";
import { getCategory, addCategory, updateCategory, deleteCategory } from "../controllers/category.controller.js";
import { verifyJwtToken, isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.get('/get', getCategory)
    .post('/create', verifyJwtToken, isAdmin, addCategory)
    .put("/update/:id", verifyJwtToken, isAdmin, updateCategory)
    .delete('/delete/:id', verifyJwtToken, isAdmin, deleteCategory)
export default router;