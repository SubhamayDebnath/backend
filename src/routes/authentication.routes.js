import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authentication.controller.js";

const router = Router();

router.post("/register", registerUser)
    .post("/login", loginUser)

export default router;