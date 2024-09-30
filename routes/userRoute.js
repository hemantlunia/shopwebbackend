import express from "express";
import { loginUser, registerUser, adminLogin, getUserDetails } from "../controllers/userController.js"
import upload from "../middleware/multer.js";
import authUser from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register",upload.single("profileImage"),registerUser);
userRouter.post("/login",loginUser);
userRouter.post("/admin",adminLogin);
userRouter.post("/user-details",authUser,getUserDetails);

export default userRouter;