import userModel from "../models/userModel.js"
import validator from "validator"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { v2 as cloudinary } from "cloudinary";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
}



// user Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Incorrect Credencials" })
    } else {
      const token = createToken(user._id);
      return res.json({ success: true, token })

    }

  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message })

  }
};




// user Register


const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const profileImage = req.file;
    // console.log(name, email, password, profileImage);

    if (!profileImage) {
      return res.json({ success: false, message: "Provide profile Image" });
    }

    // Check if user already exists
    const exist = await userModel.findOne({ email: email });
    if (exist) {
      return res.json({ success: false, message: "User Already Exists" });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please Enter a valid Email" });
    }

    // Validate password length
    if (password.length < 7) {
      return res.json({ success: false, message: "Please Enter Strong Password" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload image to Cloudinary
    let profileImageUrl = '';
    if (profileImage) {
      const result = await cloudinary.uploader.upload(profileImage.path, { resource_type: "image", folder: "shopwebUser" });
      profileImageUrl = result.secure_url;  // Store the secure URL from Cloudinary
    }

    // Create new user with profile image URL
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      profileImage: profileImageUrl
    });

    // console.log(newUser);  // Debugging

    // Save user to the database
    const user = await newUser.save();

    // Create JWT token
    const token = createToken(user._id);

    // Return success response with token
    return res.json({ success: true, token });

  } catch (error) {
    console.error(error);  // Log the error for debugging
    return res.status(500).json({ success: false, message: error.message });
  }
};


// user detail
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.body;
    // console.log(req.body.userId); 

    // Find the user by ID in MongoDB
    const user = await userModel.findById(userId).select('-password');  // Select everything except password

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Return user details
    // console.log(user);

    return res.status(200).json({ success: true, data: user });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message + "catch error" });
  }
};





// admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      return res.json({ success: true, token })
    } else {
      return res.json({ success: false, message: "Invalid" })
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message })

  }
};


export {
  loginUser,
  adminLogin,
  registerUser,
  getUserDetails
}
