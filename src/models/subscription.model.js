import mongoose from "mongoose";

const subscriptionSchema = mongoose.Schema({
    subscriber:{
        types:mongoose.Schema.ObjectId,
        ref:"User"
    },
    channel:{
        types:mongoose.Schema.ObjectId,
        ref:"User"
    }
},{timestamps:true});
const Subscription = mongoose.model("Subscription",subscriptionSchema);
export default Subscription;