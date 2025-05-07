const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required']
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  productCategory: {
    type: String,
    enum: ['Pokemon', 'CookieRun', 'Yugioh'],
    required: [true, 'Product category is required']
  },
  imageUrl: {
    type: String,
    required: [true, 'Product image URL is required']
  },
  imagePublicId: {
    type: String, // Used for deleting or updating the image on Cloudinary
    required: true
  },
  createdOn: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
