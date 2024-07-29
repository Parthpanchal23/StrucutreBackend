import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        index: true
    },
    avatar: {
        type: String,//cloudinary url
        required: [true, 'Avatar is required']
    },
    coverImage: {
        type: String,//cloudinary url
    },
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: "video"
    }],
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: True
})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)

}
userSchema.methods.genrateAcessTokoen = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullName
    }, process.env.ACESS_TOKEN_SECRET, { expiresIn: process.env.ACESS_TOKEN_EXPIRY })
}

userSchema.methods.genrateRefreshTokoen = function () {
    return jwt.sign({
        _id: this._id
    }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.RFRESH_TOKEN_EXPIRY })
}
export const User = mongoose.model("User", { userSchema })
