import mongoose from "mongoose";

const LikeSchema = mongoose.Schema({
    video:{
        types:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    },
    comment:{
        types:mongoose.Schema.types.ObjectId,
        ref:"Comment"
    },
    owner:{
        types:mongoose.Schema.types.ObjectId,
        ref:"User"
    }
},{timestamps:true});
const Like = mongoose.model("Like",LikeSchema);
export default Like;