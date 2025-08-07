import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/authentication.controller.js";
import { verifyJwtToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyJwtToken, logoutUser);
router.post("/refresh-token", refreshAccessToken);

export default router;