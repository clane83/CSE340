// Needed Resources 
const express = require("express")
const router = express.Router()
const utilities = require('../utilities/index');
const accountController = require("../controllers/accountController");

// Route to build login/registration view
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Route to post registration
router.post('/register', utilities.handleErrors(accountController.registerAccount));

module.exports = router;