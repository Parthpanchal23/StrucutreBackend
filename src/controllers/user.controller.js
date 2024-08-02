import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken";

const generateAcesssAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const acessToken = user.genrateAcessTokoen();
        const refreshToken = user.genrateRefreshTokoen();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { acessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Seomething went wrong while generating refresh and acess token")
    }
}

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

const loginUser = asyncHandler(async (req, res) => {
    // req body =>data
    // username or email
    // find ther user
    // password check
    // access and refresh token genearte and send user
    // send cookies

    const { email, username, password } = req?.body;

    if (!username && !email) {
        throw new ApiError(400, "User and password is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "USer does not exists")
    }

    const ispasswordValid = await user.isPasswordCorrect(password)

    if (!ispasswordValid) {
        throw new ApiError(401, "Invalid user credential")
    }


    const { acessToken, refreshToken } = await generateAcesssAndRefreshToken(user._id)

    const loggedinUSer = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("acessToken", acessToken, options).cookie("refreshToken", refreshToken, options).json(new APIResponse(200, { user: loggedinUSer, acessToken, refreshToken }, "User logged in Sucessfully"));

});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            refreshToken: undefined
        },
    },
        { new: true }

    );

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).
        clearCookie("acessToken", options).clearCookie("refreshToken", options).json(new APIResponse(200, {}, "User Logged out"));
})

const refreshAcessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized Request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh Token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "refresh Token expired")
        }
        const options = {
            httpOnly: true,
            secure: true
        }

        const { acessToken, newRefreshToken } = await generateAcesssAndRefreshToken(user?._id);

        return res.status(200).cookie("acessToken", acessToken, options).cookie("refreshToken", newRefreshToken, options), json(new APIResponse(200, { acessToken, refreshToken: newRefreshToken }, "Acess token refreshed"))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    const isPassword = await user.isPasswordCorrect(oldPassword);
    if (!isPassword) {
        throw new ApiError(400, "Invalid Password");
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new APIResponse(200, {}, 'Password change Suceessfully'))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return refreshAcessToken.status(200).json(200, req.user, "current User fetch sucessfully")
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All feilds are required")

    }
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            fullName,
            email
        }
    }, { new: true }).select("-password");

    return res.status(200).json(new APIResponse(200, user, "Account Detail updated Sucessfully"));

})


const updateUserAvatar = asyncHandler(async (req, res) => {
    const avtarLocalPath = req.file?.path;
    if (!avtarLocalPath) {

        throw new ApiError(400, "Avtar file is missing")
    }
    const avatar = await uploadOnCloudinary(avtarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploding avatar")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            avatar: avatar.url
        }
    }, { new: true }).select("-password")
    return refreshAcessToken.status(200), json(new APIResponse(200, user, "Avatar image updated Sucessfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverLocalPath = req.file?.path;
    if (!coverLocalPath) {

        throw new ApiError(400, "Cover image file is missing")
    }
    const coverImage = await uploadOnCloudinary(coverLocalPath);

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploding Cover Image")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            coverImage: coverImage.url
        }
    }, { new: true }).select("-password")

    return refreshAcessToken.status(200), json(new APIResponse(200, user, "Cover image updated Sucessfully"))
})
export { registerUser, loginUser, logoutUser, refreshAcessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage }