import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: [true, "User name is required"],
        trim: true,
        unique: true,
        lowercase: true,
        index: true,
    },
    fullname: {
        type: String,
        require: [true, "Fullname name is required"],
        trim: true,
        index: true,
    },
    email: {
        type: String,
        require: [true, "Email is required"],
        trim: true,
        unique: true,
        lowercase: true,
    },
    avatar: {
        type: String,
        default:''
    },
    coverImage: {
        type: String,
        default: ''
    },
    watchHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
    }],
    password: {
        type: String,
        require: [true, "Password is required"],
        select: false,
    },
    refreshToken: {
        type: String,
        select: false,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    }
}, { timestamps: true });

// hashed the password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

// compare the password with hashed saved password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

// compare the new password with hashed saved password
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

// generate access token
userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            userId: this._id,
            userName: this.username,
            userFullName: this.fullname,
            userEmail: this.email,
            userRole: this.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
}

// generate refresh token
userSchema.methods.generateRefreshAccessToken = async function () {
    return jwt.sign(
        {
            userId: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
}

const User = mongoose.model("User", userSchema);
export default User;