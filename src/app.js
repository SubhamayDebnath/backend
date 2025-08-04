import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { limit } from './constants.js';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({
    limit: limit
}));

app.use(express.urlencoded({
    extended: true,
    limit: limit
}));

app.use(express.static("public"));
app.use(cookieParser());


// import Routes
import authenticationRoutes from "./routes/authentication.routes.js";

// routes declaration
app.use("/api/v1/auth", authenticationRoutes);

export default app;