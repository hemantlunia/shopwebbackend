import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
   const { token } = req.headers;
   // console.log(token);

   if (!token) {
      return res.json({ success: false, message: "Not Authorized" })
   }

   try {
      const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

      req.body.userId = tokenDecode.id;


      next()

   } catch (error) {
      console.log(error);
      return res.json({ success: false, message: error.message });
   }
};


export default authUser;