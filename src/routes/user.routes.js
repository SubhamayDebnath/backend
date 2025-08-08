import { Router } from "express";
import { user ,userWatchList } from "../controllers/user.controller.js";
import { verifyJwtToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verifyJwtToken, user);
router.get("/watchlist",verifyJwtToken,userWatchList);

export default router;