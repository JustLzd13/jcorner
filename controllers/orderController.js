//[SECTION] Dependencies and Modules
const bcrypt = require('bcrypt');
const Order = require('../models/Order.js'); // Import Order model
const Cart = require('../models/Cart.js');   // Import Cart model
const auth = require("../auth/auth.js"); 
const { errorHandler } = auth;


module.exports.createOrder = async (req, res) => {
  try {
   	const userId = req.user.id;

    // Find the user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.cartItems.length === 0) {
      return res.status(400).json({ error: 'No items to Checkout' });
    }

    // Create new order from cart data
    const newOrder = new Order({
      userId,
      productsOrdered: cart.cartItems, // Copy cart items into the order
      totalPrice: cart.totalPrice,
      status: 'Pending', // Default status
      orderDate: new Date(),
    });

    // Save the order
    const savedOrder = await newOrder.save();

    // Clear the user's cart
    cart.cartItems = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({ message: 'Ordered successfully' });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Error placing order', error: err.message });
  }
};



module.exports.getUserOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user's orders
    const orders = await Order.find({ userId }).sort({ orderDate: -1 }); // Sort by most recent

    // Check if user has no orders
    if (orders.length === 0) {
      return res.status(404).json({ error: 'No orders found.' });
    }

    res.status(200).json({ orders: orders });
  } catch (err) {
    console.error('Error retrieving orders:', err);
    res.status(500).json({ error: 'Error retrieving orders', error: err.message });
  }
};



module.exports.getAllOrders = async (req, res) => {
  try {
    
  	const userId = req.user.id;

    // Fetch all orders, sorted by latest first
    const orders = await Order.find().sort({ orderDate: -1 });

    // Check if there are no orders
    if (orders.length === 0) {
      return res.status(404).json({ error: 'No orders found.' });
    }

    res.status(200).json({ orders: orders });
  } catch (err) {
    console.error('Error retrieving orders:', err);
    res.status(500).json({ error: 'Error retrieving orders', error: err.message });
  }
};


module.exports.updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
  
    try {
      // Update order status
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      );
  
      if (!updatedOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      res.status(200).json({ message: 'Order status updated successfully', order: updatedOrder });
    } catch (err) {
      console.error('Error updating order status:', err);
      res.status(500).json({ error: 'Error updating order status', error: err.message });
    }
  };

// Redundant because only status and total price can be updated here but for emergency cases when total is bugged and the total amount does not add up to the subtotal total we can use this to arrange the total amount
module.exports.updateOrderInfo = async (req, res) => {
    const { orderId } = req.params;
    const updateFields = req.body;
  
    try {
      // Update order information
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        updateFields,
        { new: true }
      );
  
      if (!updatedOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      res.status(200).json({ message: 'Order information updated successfully', order: updatedOrder });
    } catch (err) {
      console.error('Error updating order information:', err);
      res.status(500).json({ error: 'Error updating order information', error: err.message });
    }
  };
  
module.exports.deleteOrder = async (req, res) => {
    const { orderId } = req.params;
  
    try {
      // Delete order
      const deletedOrder = await Order.findByIdAndDelete(orderId);
  
      if (!deletedOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      res.status(200).json({ message: 'Order deleted successfully' });
    } catch (err) {
      console.error('Error deleting order:', err);
      res.status(500).json({ error: 'Error deleting order', error: err.message });
    }
  };
  

module.exports.viewByCategory = async (req, res) => {
    const { status } = req.params;
  
    // Ensure status is one of the allowed values
    const allowedStatuses = ['Pending', 'Paid', 'Completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status category' });
    }
  
    try {
      const orders = await Order.find({ status }).sort({ orderDate: -1 });
  
      if (orders.length === 0) {
        return res.status(404).json({ message: `No ${status} orders found.` });
      }
  
      res.status(200).json({ orders });
    } catch (err) {
      console.error('Error viewing orders by category:', err);
      res.status(500).json({ error: 'Error retrieving orders by category', error: err.message });
    }
  };
  