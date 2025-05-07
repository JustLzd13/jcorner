const express = require("express");
const productController = require("../controllers/productController.js");
const { upload } = require('../middleware/cloudinary.js');

const auth = require("../auth/auth.js");
const { verify, verifyAdmin } = auth;

const router = express.Router();

// Admin-only routes
router.post('/create-product', verify, verifyAdmin, upload.single('image'), productController.createProduct);
router.get('/all-product', verify, verifyAdmin, productController.retrieveAllProduct);
router.patch('/:productId/update-product', verify, verifyAdmin, upload.single('image'), productController.updateProductInfo);
router.patch('/:productId/archive', verify, verifyAdmin, productController.archiveProduct);
router.patch('/:productId/activate', verify, verifyAdmin, productController.activateProduct);
router.delete('/:productId/delete', verify, verifyAdmin, productController.deleteProduct); 

// Public or user-accessible routes
router.get('/active-product', productController.retrieveAllActiveProducts);
router.get('/view-products-by', productController.viewProductsBy); 
router.get('/:productId', productController.retrieveSingleProduct);
router.post('/search-by-name', productController.searchByName);
router.post('/search-by-price', productController.searchByPrice);


module.exports = router;
