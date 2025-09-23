// Needed Resources 
const express = require("express")
const router = new express.Router()
const accController = require("../controllers/accountController")
const utilities = require('../utilities/index')

// Route to build inventory by classification view
router.get("/login", utilities.handleErrors(accController.buildLogin));

module.exports = router;