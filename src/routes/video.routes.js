import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import { uploadVideo,updateVideo, deleteVideo } from "../controllers/video.controller.js";
import { verifyJwtToken } from "../middlewares/auth.middleware.js";
const router = Router();

router.post('/upload', verifyJwtToken, upload.fields([{ name: "file", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), uploadVideo)
    .delete('/delete/:id', deleteVideo)
    .put('/update/:id', verifyJwtToken, upload.fields([{ name: "file", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), updateVideo)

export default router;