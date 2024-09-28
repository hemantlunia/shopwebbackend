import express from "express";
import {placeOredr,placeOredrRazorpay,placeOredrStripe,allOrders,updateStatus,userOrders} from "../controllers/orderController.js"
import adminAuth from "../middleware/adminAuth.js"
import authUser from "../middleware/auth.js";

const orderRouter = express.Router();


// admin feature
orderRouter.post("/list",adminAuth,allOrders);
orderRouter.post("/status",adminAuth,updateStatus);

// payment feature
orderRouter.post("/place",authUser,placeOredr);
orderRouter.post("/stripe",authUser,placeOredrStripe);
orderRouter.post("/razorpay",authUser,placeOredrRazorpay);

// user feature
orderRouter.post("/userorders",authUser,userOrders);

export default orderRouter;