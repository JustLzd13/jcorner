const express = require("express");
const cartController = require("../controllers/cartController.js");

const auth = require("../auth/auth.js");
const { verify } = auth;

const router = express.Router();


// Route for getting cart info (authenticated users only)
router.get('/get-cart', verify, cartController.retrieveUserCart);

// Route for add to cart (authenticated users only)
router.post('/add-to-cart', verify,  cartController.addToCart);

// Route for updating cart quantity (authenticated users only)
router.patch('/update-cart-quantity', verify, cartController.updateCartQuantity);

// Route for removing cart items (authenticated users only)
router.patch('/:productId/remove-from-cart', verify, cartController.removeFromCart);

// Route for clear cart items (authenticated users only)
router.put('/clear-cart', verify, cartController.clearCart);




module.exports = router;