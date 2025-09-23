// Needed Resources 
const express = require("express")
const router = express.Router()
const utilities = require('../utilities/index');
const accountController = require("../controllers/accountController");

// Route to build inventory by classification view
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));

module.exports = router;