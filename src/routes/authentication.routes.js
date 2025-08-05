import { Router } from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/authentication.controller.js";
import { verifyJwtToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser)
    .post("/login", loginUser)
    .post("/logout", verifyJwtToken, logoutUser);

export default router;