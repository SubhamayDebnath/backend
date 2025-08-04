import dotenv from "dotenv";
import app from "./app.js";
import databaseConnection from "./database/database.connection.js";
dotenv.config({path:".env"});

const PORT = process.env.PORT || 3000;

// connect database and start server
databaseConnection()
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server is running on http://localhost:${PORT}`);
    })
})
.catch((error)=>{
    console.log("Failed to connect database. Error : ", error.message || "");
})