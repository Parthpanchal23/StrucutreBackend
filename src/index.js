import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "./env"
})

connectDB().then(() => {
    let PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`Server is Running at  ${PORT} `);
    })
}).catch((err) => {
    console.log("DB conenction failed !!", err);
})

















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