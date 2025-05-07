//[Dependencies and Modules] 
const express = require('express');
const userController = require('../controllers/userController.js');


const { verify, verifyAdmin } = require("../auth/auth.js");

//[Routing Component] 
const router = express.Router();


router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);


router.get("/details", verify, userController.getProfile);
router.get("/all-users", verify, verifyAdmin, userController.getAllUsers);

router.patch("/:id/set-as-admin", verify, verifyAdmin, userController.setAsAdmin);
router.patch("/:id/unset-admin", verify, verifyAdmin, userController.unsetAsAdmin);

router.patch('/update-password', verify, userController.updatePassword);
router.patch('/update-profile', verify, userController.updateProfile);





module.exports = router;