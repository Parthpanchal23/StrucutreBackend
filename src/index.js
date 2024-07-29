import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path: "./env"
})

connectDB();

















/*
// single index method to connect Mongo Db
import express from "express";
const app = express();
(async () => {
    try {
        await mongoose.connect(`${process.env.MOGODB_URL}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("EXPRESS connection Error");
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log("application running on ", process.env.PORT);
        })
    } catch (error) {
        console.error("ERROR", error);
    }
}
)()*/