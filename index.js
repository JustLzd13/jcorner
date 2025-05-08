// [Dependencies and Modules] 
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


//[Routes] 
const userRoutes = require("./routes/user.js");
const productRoutes = require("./routes/product.js");
const cartRoutes = require("./routes/cart.js");
const orderRoutes = require("./routes/order.js");
    

require('dotenv').config();


const app = express();

app.use(express.json());


const corsOptions = {
    origin: ['http://localhost:8000','http://localhost:3000', 'http://localhost:4000', 'https://jcorner.onrender.com'], 
    credentials: true, 
    optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));




mongoose.connect(process.env.MONGODB_STRING);
mongoose.connection.once('open',()=> console.log('Now Connected to MongoDB Atlas.'));


app.use("/j-corner/users", userRoutes);
app.use("/j-corner/products", productRoutes);
app.use("/j-corner/cart", cartRoutes);
app.use("/j-corner/orders", orderRoutes);


if(require.main === module){
    app.listen( process.env.PORT || 3000, () => {
        console.log(`API is now online on port ${ process.env.PORT }`)
    });
}

module.exports = { app, mongoose };