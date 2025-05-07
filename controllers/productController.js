const bcrypt = require('bcrypt');
const Product = require("../models/Product.js");

const { errorHandler } = require("../auth/auth.js");
const cloudinary = require('cloudinary').v2;


module.exports.createProduct = async (req, res) => {
    try {
      const { name, description, price, productCategory } = req.body;
  
      const newProduct = new Product({
        name,
        description,
        price,
        productCategory,
        imageUrl: req.file.path, // Cloudinary gives this
        imagePublicId: req.file.filename // useful for deletion
      });
  
      const existingProduct = await Product.findOne({ name });
      if (existingProduct) {
        return res.status(409).json({ error: 'Product already exists' });
      }
  
      const savedProduct = await newProduct.save();
      return res.status(201).json(savedProduct);
  
    } catch (error) {
      console.error("Error in createProduct:", error);  // VERY IMPORTANT for debugging
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

module.exports.retrieveAllProduct = (req, res) => {

    return Product.find({})
    .then(result => {
        if(result.length > 0){
            return res.status(200).send(result);
        } else {
            return res.status(404).send({ message: 'No products found' });
        }
    })
    .catch(error => errorHandler(error, req, res))
};

module.exports.retrieveAllActiveProducts = (req, res) => {

    return Product.find({ isActive: true })
    .then(result => {
        if(result.length > 0){
            return res.status(200).send(result);
        } else {
            return res.status(404).send({ error: 'No active products found' });
        }
    })
    .catch(error => errorHandler(error, req, res))

};

module.exports.retrieveSingleProduct = (req, res) => {

    Product.findById(req.params.productId)
    .then(result => {
        if(result){
            return res.status(200).send(result);
        } else {
            return res.status(404).send({ error: 'Product not found' });
        }
    })
    
};


module.exports.updateProductInfo = async (req, res) => {
  try {
    const { name, description, price, productCategory } = req.body;
    const productId = req.params.productId;

    // Fetch existing product to check old image
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // If new image uploaded, delete the old one and update
    let updatedFields = { name, description, price, productCategory };

    if (req.file) {
      // Delete old image from Cloudinary
      if (existingProduct.imagePublicId) {
        await cloudinary.uploader.destroy(existingProduct.imagePublicId);
      }

      updatedFields.imageUrl = req.file.path;
      updatedFields.imagePublicId = req.file.filename;
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updatedFields, { new: true });

    return res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports.archiveProduct = (req, res) => {

    let updateActiveField = {
        isActive: false
    }

    Product.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then(product => {
        if (product) {

            if(!product.isActive){
                return res.status(200).send({message: 'Product already archived', archivedProduct: product})
            }

            return res.status(200).send({success: true, message: 'Product archived successfully'});
        } else {
            res.status(404).send({error: 'Product not found'});
        }
    })
    .catch(error => errorHandler(error, req, res));
};


module.exports.activateProduct = (req, res) => {

    let updateActiveField = {
        isActive: true
    }
    
    Product.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then(product => {
        if (product) {

            if(product.isActive){
                return res.status(200).send({message: 'Product already active', activatedProduct: product})
            }

            return res.status(200).send({success: true, message: 'Product activated successfully'});
        } else {
            res.status(404).send({error: 'Product not found'});
        }
    })
    .catch(error => errorHandler(error, req, res));
};


module.exports.searchByName = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Product name is required.' });
        }

        // Use a regular expression for case-insensitive search
        const foundProduct = await Product.find({
            name: { $regex: name, $options: 'i' }
        });

        // If no product is found, return a 404 error
        if (foundProduct.length === 0) {
            return res.status(404).json({ error: 'No product found' });
        }

        res.status(200).json(foundProduct);
    } catch (error) {
        console.error('Error searching for product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports.searchByPrice = async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.body;

    // Check if both minPrice and maxPrice are provided
    if (minPrice === undefined || maxPrice === undefined) {
      return res.status(400).json({ error: 'Both minPrice and maxPrice are required' });
    }

    // Validate that minPrice is less than or equal to maxPrice
    if (minPrice > maxPrice) {
      return res.status(400).json({ error: 'minPrice cannot be greater than maxPrice' });
    }
    
    // Search for product within the price range
    const products = await Product.find({
      price: { $gte: minPrice, $lte: maxPrice }
    });

    // If no product found
    if (products.length === 0) {
      return res.status(404).json({ error: 'No products found within the specified price range' });
    }

    // Return the found product
    res.status(200).json(products);
  } catch (error) {
    console.error('Error searching for products:', error);
    res.status(500).json({ error: 'An error occurred while searching for products' });
  }
};


module.exports.deleteProduct = async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.productId);
  
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      res.status(200).json({ success: true, message: 'Product deleted successfully', deletedProduct: product });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  module.exports.viewProductsBy = async (req, res) => {
    try {
      const { category } = req.query;
  
      if (!category || !['Pokemon', 'CookieRun', 'Yugioh'].includes(category)) {
        return res.status(400).json({ error: 'Invalid or missing product category. Valid categories: Pokemon, CookieRun, Yugioh.' });
      }
  
      const products = await Product.find({ productCategory: category });
  
      if (products.length === 0) {
        return res.status(404).json({ message: `No products found in category: ${category}` });
      }
  
      res.status(200).json(products);
    } catch (error) {
      console.error('Error viewing products by category:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  