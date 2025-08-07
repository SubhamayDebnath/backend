import { Router } from "express";
import { getCategory, addCategory, updateCategory, deleteCategory } from "../controllers/category.controller.js";
import { verifyJwtToken, isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.get('/get', getCategory);
router.post('/create', verifyJwtToken, isAdmin, addCategory);
router.put("/update/:id", verifyJwtToken, isAdmin, updateCategory);
router.delete('/delete/:id', verifyJwtToken, isAdmin, deleteCategory);

export default router;