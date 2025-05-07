//[SECTION] Dependencies and Modules
const bcrypt = require('bcrypt');
const User = require('../models/User.js');
const auth = require("../auth/auth.js"); 
const { errorHandler } = auth;





//[User registration] 
module.exports.registerUser = (req, res) => {


    if(!req.body.email.includes("@")){
        return res.status(400).send({message: "Email invalid"});
    }

    else if(req.body.mobileNo.length !== 11){
        return res.status(400).send({message: "Mobile number invalid"});
    }

    else if(req.body.password.length < 8){
        return res.status(400).send({message: "Password must be atleast 8 characters"});
    }

    else {

        let newUser = new User({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            mobileNo : req.body.mobileNo,
            password : bcrypt.hashSync(req.body.password, 10)
        })

        return newUser.save()
        .then((result) => res.status(201).send({message: 'Registered Successfully'}))
        .catch(error => errorHandler(error, req, res));
    }

    
};

module.exports.loginUser = (req, res) => {
    if(req.body.email.includes("@")){
        return User.findOne({ email : req.body.email })
        .then(result => {
            if(result == null){
                return res.status(404).send({message: 'No email Found'});
            } else {
                const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
                if (isPasswordCorrect) {
                    return res.status(200).send({ access : auth.createAccessToken(result)});
                } else {
                    return res.status(401).send({message: 'Email and password do not match'});
                }
            }
        })
        .catch(error => errorHandler(error, req, res));
    }else{
        return res.status(400).send({message: 'Invalid Email'});
    }
};


module.exports.getProfile = (req, res) => {
   User.findOne({ _id: req.user.id }, { password: 0 }) // Exclude password field
        .then(user => {
            if (!user) {
                return res.status(404).send({ error: 'User not found' });
            }
            res.status(200).send({ user });
        })
        .catch(error => errorHandler(error, req, res));

};

// Function to get all users (accessible only to admins)
module.exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find({}, { password: 0 }); // Exclude password field
      res.status(200).json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users', details: error });
    }
  };

module.exports.setAsAdmin = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find and update the user's role
    const updatedUser = await User.findByIdAndUpdate(userId, { isAdmin: true }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ updatedUser: updatedUser });
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    res.status(500).json({ error: 'Failed in Find', details: error });
  }
};

module.exports.unsetAsAdmin = async (req, res) => {
    try {
      const userId = req.params.id;
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { isAdmin: false },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ updatedUser });
    } catch (error) {
      console.error('Error unsetting admin role:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  };
  

module.exports.updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { id } = req.user; 

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate( id, { password: hashedPassword });


    res.status(201).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports.updateProfile = async (req, res) => {
    try {    
        // Get the user ID from the authenticated token
        const userId = req.user.id;

        // Retrieve the updated profile information from the request body
        const { firstName, lastName, email, mobileNo } = req.body;

        // Update the user's profile in the database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { firstName, lastName, email, mobileNo },
            { new: true }
        );

        res.send(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to update profile' });
    }
}

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
