import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"


// place order "COD"
const placeOredr = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        if (!userId || !items || !amount || !address) {
            return res.json({ success: false, message: "All fields required!" });
        }

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "COD", 
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        await userModel.findByIdAndUpdate(userId, { cartData: {} });
        return res.json({ success: true, message: "order Placed" })

    } catch (error) {
        console.log(error);
        return res.json({ success: true, message: error.message })

    }

}
// place order "Stripe"
const placeOredrStripe = async (req, res) => {

}
// place order "razorpay"
const placeOredrRazorpay = async (req, res) => {

}


// All orders for admin Pannel
const allOrders = async (req, res) => {
   try {
    const orders = await orderModel.find({});
    return res.json({success: true, message: orders});
   } catch (error) {
    console.log(error);
    return res.json({success: false, message: error.message});
       
   }
}

// userorder frontend    
const userOrders = async (req, res) => {
        try {
            const {userId} = req.body;
            const orders = await orderModel.find({userId})
            return res.json({success: true, message: orders})
        } catch (error) {
            console.log(error);
            return res.json({success: false, message: error.message})
        }
}

// update order status for only admin
const updateStatus = async (req, res) => {
   try {
         const {orderId, status} = req.body;
 
         await orderModel.findByIdAndUpdate(orderId,{status})
         return res.json({success: true, message: "Status Updated!"})
   } catch (error) {
    console.log(error);
    return res.json({success: false, message: "Try Again!"})
   }
}

export {
    updateStatus,
    userOrders,
    allOrders,
    placeOredr,
    placeOredrRazorpay,
    placeOredrStripe
}