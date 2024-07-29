import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MOGODB_URL}/${DB_NAME}`)
        console.log(`\n MONGO DB Conencted !! DB HOST:- ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MONGODB Conenction error", error);
        process.exit(1)
    }
}

export default connectDB;