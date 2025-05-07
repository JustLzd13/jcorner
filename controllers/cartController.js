//[SECTION] Dependencies and Modules
const bcrypt = require('bcrypt');
const Cart = require('../models/Cart.js');
const auth = require("../auth/auth.js"); 
const { errorHandler } = auth;



module.exports.retrieveUserCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find cart associated with user's ID
    const cart = await Cart.findOne({ userId });

    // If no cart found, return message
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for the user' });
    }

    // Send found cart to client
    res.status(200).json(cart);
  } catch (err) {
    // Handle errors
    console.error('Error retrieving cart:', err);
    res.status(500).json({ message: 'Error retrieving cart', error: err.message });
  }
};


module.exports.addToCart = async (req, res) => {
  try {
    
    const userId = req.user.id;

    // Extract product details from request body
    const { productId, quantity, subtotal } = req.body;

    if (!productId || !quantity || !subtotal) {
      return res.status(400).json({ message: 'Product ID, quantity, and subtotal are required' });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart if not found
      cart = new Cart({
        userId,
        cartItems: [{ productId, quantity, subtotal }],
        totalPrice: subtotal,
      });
    } else {
      // Check if product already exists in cartItems
      const existingItem = cart.cartItems.find((item) => item.productId.toString() === productId);

      if (existingItem) {
        // Update quantity and subtotal
        existingItem.quantity += quantity;
        existingItem.subtotal += subtotal;
      } else {
        // Add new item to cart
        cart.cartItems.push({ productId, quantity, subtotal });
      }

      // Recalculate total price
      cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);
    }

    // Save the updated cart
    await cart.save();

    res.status(200).json({ message: 'Item added to cart successfully', cart });
  } catch (err) {
    console.error('Error updating cart:', err);
    res.status(500).json({ message: 'Error updating cart', error: err.message });
  }
};




module.exports.updateCartQuantity = async (req, res) => {
  try {

    const userId = req.user.id;

    // Extract productId and new quantity from request body
    const { productId, newQuantity } = req.body;
    if(!newQuantity < 0){
        return res.status(400).json({ message: 'Quantity must positive number' });
    }

    if (!productId || !newQuantity ) {
      return res.status(400).json({ message: 'Product ID, quantity, and subtotal are required.' });
    }

    // Find the user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for the user.' });
    }

    // Check if the product exists in the cart
    const cartItem = cart.cartItems.find((item) => item.productId.toString() === productId);

    if (!cartItem) {
      return res.status(404).json({ message: 'Item not found in the cart.' });
    }

    // Update quantity and subtotal
    const productPrice = cartItem.subtotal / cartItem.quantity;
    cartItem.quantity = newQuantity;
    cartItem.subtotal = productPrice * newQuantity;

    // Recalculate total price
    cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

    // Save the updated cart
    await cart.save();

    res.status(200).json({ message: 'Items quantity updated successfully', cart });
  } catch (err) {
    console.error('Error updating cart quantity:', err);
    res.status(500).json({ message: 'Error updating cart quantity', error: err.message });
  }
};




module.exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get productId from request params
    const productId = req.params.productId;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    // Find the user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found for the user' });
    }

    // Find the item in the cart
    const cartItem = cart.cartItems.find((item) => item.productId.toString() === productId);

    if (!cartItem) {
      return res.status(404).json({ error: 'Item not found in the cart.' });
    }

    // Remove item from cartItems array
    cart.cartItems = cart.cartItems.filter((item) => item.productId.toString() !== productId);

    // Recalculate totalPrice & ensure it doesn't go negative
    const newTotalPrice = cart.totalPrice - cartItem.subtotal;
    cart.totalPrice = Math.max(0, newTotalPrice); // Ensure it doesn't become negative

    // Save the updated cart
    const updatedCart = await cart.save();

    res.status(200).json({ message: 'Item removed successfully', cart: updatedCart });
  } catch (err) {
    console.error('Error removing item from cart:', err);
    res.status(500).json({ error: 'Error removing item from cart', error: err.message });
  }
};



module.exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found.' });
    }

    // Clear the cart by setting cartItems to an empty array and totalPrice to 0
    cart.cartItems = [];
    cart.totalPrice = 0;

    // Save the updated cart
    await cart.save();

    res.status(200).json({ message: 'Cart cleared successfully', cart });
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ message: 'Error clearing cart', error: err.message });
  }
};



