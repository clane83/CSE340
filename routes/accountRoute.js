// Needed Resources 
const express = require("express")
const router = express.Router()
const utilities = require('../utilities/index');
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation')


// Route to build login/registration view
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/registration", utilities.handleErrors(accountController.buildRegister));

// Route to post registration
router.post(
    "/registration",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)


router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    accountController.loginAccount
)

module.exports = router;