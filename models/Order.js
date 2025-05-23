const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
	userId: {
		type: String,
		required:[true, 'User ID is Required']
	},
	productsOrdered:[
		{
			productId:{
				type: String,
				required: [true, 'Product ID is Required']
			},
			quantity:{
				type: Number,
				required: [true, 'quantity is Required']
			},
			subtotal: {
                type: Number,
                required: [true, 'subtotal is Required']
            }
		},	
	],
	totalPrice: {
		type: Number,
		required: [true, 'totalPrice is Required']
	},
	orderedOn:{
		type: Date,
		default: Date.now
	},
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Completed'],
        required: [true, 'Status is required']
      }
});

module.exports = mongoose.model("Order", orderSchema);	