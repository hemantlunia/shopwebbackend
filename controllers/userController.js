import userModel from "../models/userModel.js"
import validator from "validator"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const createToken = (id)=>{
  return jwt.sign({id},process.env.JWT_SECRET);
}



// user Login
const loginUser = async(req,res)=>{
    try {
      const {email,password} = req.body;
      const user = await userModel.findOne({email});

      if (!user) {
        return res.json({success: false, message: "User not found"})
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.json({success: false, message: "Incorrect Credencials"})
      } else{
        const token = createToken(user._id);
        return res.json({success: true, token})

      }

    } catch (error) {
      console.log(error);
      return res.json({success: false, message: error.message})
      
    }
};




// user Register
const registerUser = async(req,res)=>{
  try {
    const {name, email, password} = req.body;

    const exist = await userModel.findOne({email:email});
    if (exist) {
      return res.json({success: false, message: "User Already Exists"});
    }

    if (!validator.isEmail(email)) {
      return res.json({success: false, message: "Please Enter a valid Email"});
    }
    if (password.length < 7) {
      return res.json({success: false, message: "Please Enter Strong Password"});
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt)

    const newUser = new userModel({
      name,
      email,
      password:hashedPassword
    });

    const user = await newUser.save();
    
    const token = createToken(user._Id);

    return res.json({success: true,token})

  } catch (error) {
    console.log();
    return res.json({success: false,message:error.message})
  }
};




// admin login
const adminLogin = async(req,res)=>{
      try {
        const {email, password} = req.body;
        if (email === process.env.ADMIN_EMAIL  &&  password === process.env.ADMIN_PASSWORD) {
          const token = jwt.sign(email+password, process.env.JWT_SECRET);
          return res.json({success: true, token})
        } else{
          return res.json({success: false, message: "Invalid"})
        }
      } catch (error) {
        console.log(error);
        return res.json({success: false, message: error.message})
        
      } 
};


export {
    loginUser,
    adminLogin,
    registerUser
}
