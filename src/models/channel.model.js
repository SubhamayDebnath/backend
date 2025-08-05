import mongoose from "mongoose";
const ChannelSchema = mongoose.Schema({
    channelName: {
        type: String,
        require: [true, "Channel name is required"],
        trim: true,
        unique: true,
        index: true
    },
    description: {
        type: String,
        require: [true, "Channel name is required"],
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category"
    },
    videos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
    }],
    subscriptionCount: {
        type: Number,
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });
const Channel = mongoose.model("Channel", ChannelSchema);
export default Channel;