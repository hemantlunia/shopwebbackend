import jwt from "jsonwebtoken";


const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.headers
    // console.log(token);
    
    if (!token) {
      return res.json({ success: false, message: "Not Authorized" })
    }
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (tokenDecode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
      return res.json({ success: false, message: "Not Authorized" })
    } else {
      next()
    }

  } catch (error) {
    console.log(error);

    return res.json({ success: false, message: `Not Authorized : ${error.message}` })
  }
}

export default adminAuth;