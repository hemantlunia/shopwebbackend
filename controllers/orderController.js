import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import Stripe from "stripe";
import razorpay from "razorpay"

const currency = "USD";
const deliveryCharge = 10;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



const razorpayInstance = new razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET
})


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
         try {
            // const {userId,orderData} = req.body;
            const { userId, items, amount, address } = req.body;
            // console.log(userId, items, address, amount);
            // console.log(req.body);
            // console.log();
            
            
       
        //   return null;
            
            
            const {origin} = req.headers;

            const orderdata = {
                userId,
                items,
                amount,
                address,
                paymentMethod: "Stripe",
                payment: false,
                date: Date.now()
            }

            const newOrder = new orderModel(orderdata)
            await newOrder.save();

            const line_items = items.map((item)=>({
                price_data: {
                    currency: currency,
                    product_data: {
                        name: item.name
                    },
                    unit_amount: item.price * 100 
                },
                quantity: item.quantity
            }))

            line_items.push({ 
                price_data: {
                    currency: currency,
                    product_data: {
                        name: "deliveryCharge"
                    },
                    unit_amount: deliveryCharge * 100
                },
                quantity: 1
            })

            const session = await stripe.checkout.sessions.create({
                success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
                cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
                line_items,
                mode: "payment",
                currency: currency
            });
            return res.json({success: true, session_url: session.url})
         } catch (error) {
            console.log(error);
            return res.json({success: false, message: error.message})
         }
}

// verify stripe
const verifyStripe = async(req,res)=>{
         try {
            const {orderId, success, userId} = req.body;

            if (success === "true") {
                await orderModel.findByIdAndUpdate(orderId,{payment: true});
                await userModel.findByIdAndUpdate(userId,{cartData: {}})
                return res.json({success: true, message: "Order verified"})
            } else{
                await orderModel.findByIdAndDelete(orderId)
                return res.json({success: false, message: "Try Again!"})
            }
         } catch (error) {
            console.log(error);
            return res.json({success: false, message: error.message})
            
         }
}
// place order "razorpay"
const placeOredrRazorpay = async (req, res) => {
       try {
        const { userId, items, amount, address } = req.body;

        const orderdata = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderdata)
        await newOrder.save();

        const options = {
            amount : amount * 100,
            currency : currency,
            receipt : newOrder._id.toString()
        }

         razorpayInstance.orders.create(options,(error,order)=>{
            if (error) {
                console.log(error);
                return res.json({success: false, message: error})
            }
             
            return res.json({success: true, order})
        })
       } catch (error) {
        console.log(error);
        return res.json({success: false, message: error.message})
        
       }
}

// verify razorpay
const verifyRazorpay = async(req,res)=>{
    try {
        const {userId, razorpay_order_id } = req.body;
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
        console.log(orderInfo);
        if (orderInfo.status === "paid") {
            await orderModel.findByIdAndUpdate(orderInfo.receipt, {payment: true})
            await userModel.findByIdAndUpdate(userId, {cartData: {}})
            return res.json({success: true, message: "Payment Successful"})
        } else{
            return res.json({success: false, message: "Payment Failed!"})
        }
        
    } catch (error) {
        console.log(error);
        return res.json({success: false, message: error.message})
    }
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
    placeOredrStripe,
    verifyStripe,
    verifyRazorpay
}