
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {

        const token = req.cookies.acessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "un authorized request")
        }

        const decodedToken = jwt.verify(token, process.env.ACESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Acess Token");
        }

        req.user = user;
        next()

    } catch (error) {

        throw new ApiError(401, error?.message || "Invalid Acess Token");
    }
})