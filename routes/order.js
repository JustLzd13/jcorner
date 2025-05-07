const express = require("express");
const cartController = require("../controllers/orderController.js");
const auth = require("../auth/auth.js");
const { verify, verifyAdmin } = auth;

const router = express.Router();

// Route for creating an order (authenticated users only)
router.post('/checkout', verify, cartController.createOrder);

// Route for fetching orders of the authenticated user
router.get('/my-orders', verify, cartController.getUserOrder);

// Route for fetching all orders (admin access required)
router.get('/all-orders', verify, verifyAdmin, cartController.getAllOrders);

// Route for updating order status (admin access required)
router.put('/update-status/:orderId', verify, verifyAdmin, cartController.updateOrderStatus);

// Route for updating order information (admin access required)
router.put('/update-info/:orderId', verify, verifyAdmin, cartController.updateOrderInfo);

// Route for deleting an order (admin access required)
router.delete('/delete/:orderId', verify, verifyAdmin, cartController.deleteOrder);

// Route for viewing orders by status/category (admin access required)
router.get('/view-by-category/:status', verify, verifyAdmin, cartController.viewByCategory);



module.exports = router;
