import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;
    if ([fullName, email, username, password].some((fields) => fields?.trim() === ""
    )) {
        throw new ApiError(400, "ALL fields are required")
    }

    const existUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existUser) {
        throw new ApiError(409, "User with email or use name  already exist")
    }


    const avtarLocalPath = req.files?.avatar[0]?.path;
    // const coverLocaPath = req.files?.coverImage[0]?.path;

    let coverLocaPath;
    if (req?.files && Array.isArray(req?.files?.coverImage) && req?.files?.coverImage?.length > 0) {
        coverLocaPath = req.files.coverImage[0].path;
    }
    if (!avtarLocalPath) {
        throw new ApiError(400, "Avtar file is rewuired");
    }
    const avatar = await uploadOnCloudinary(avtarLocalPath);
    const coverImage = await uploadOnCloudinary(coverLocaPath);
    if (!avatar) {
        throw new ApiError(400, "Avtar file is required")
    }
    if (!coverImage) {
        throw new ApiError(400, "cover file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar?.url || "",
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password
    })

    const createdUser = await User.findById(user?._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while register user")
    }

    return res.status(201).json(new APIResponse(200, createdUser, "User registre sucessfully"))

})

export { registerUser }