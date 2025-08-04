import mongoose from "mongoose";

const databaseConnection = async () => {
    try {
        const { connection } = await mongoose.connect(process.env.MONGO_URL);
        console.log("Database connected successfully with : ", connection.host);
    } catch (error) {
        console.log("Database connection error : ", error);
        process.exit(1);
    }
}

export default databaseConnection;