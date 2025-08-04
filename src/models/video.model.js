import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({
    videoFile: {
        type: String,
        require: [true, "Video File is required"],
    },
    thumbnail: {
        type: String,
        require: [true, "Thumbnail is required"]
    },
    title: {
        type: String,
        require: [true, "Title is required"],
        trim: true,
        lowercase: true,
        index: true,
    },
    description: {
        type: String,
        require: [true, "Description is required"],
        trim: true,
    },
    duration: {
        type: Number,
        require: [true, "Duration is required"],
    },
    viewsCount: {
        type: Number,
        default: 0
    },
    likesCount: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });


const Video = mongoose.model("Video", videoSchema);
export default Video;