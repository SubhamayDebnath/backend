import mongoose from "mongoose";

const playListSchema = new mongoose.Schema({
    playListName:{
        type: String,
        require: [true, "Playlist name is required"],
        trim: true,
        unique: true,
        index: true
    },
    description:{
        type:String,
        require:[true,"Description is required"],
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    videos:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        default:[],
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"]
    }
},{timestamps:true});

const PlayList = mongoose.model("Playlist",playListSchema);
export default PlayList;