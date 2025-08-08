import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import { getAllVideos,getVideoById,getVideoByCategory,getVideosByUser ,uploadVideo, updateVideo, deleteVideo } from "../controllers/video.controller.js";
import { verifyJwtToken } from "../middlewares/auth.middleware.js";
const router = Router();

router.get('/', getAllVideos);
router.get('/:id', getVideoById);
router.get('/category/:slug',getVideoByCategory);
router.get("/user/:slug", getVideosByUser);
router.post('/upload', verifyJwtToken, upload.fields([{ name: "file", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), uploadVideo);
router.delete('/delete/:id', deleteVideo);
router.put('/update/:id', verifyJwtToken, upload.fields([{ name: "file", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), updateVideo);

export default router;