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


// // Back-compat aliases so old "register" paths still work
// router.get("/register", (req, res) => res.redirect(302, "/account/registration"));

// router.post(
//     "/register",
//     regValidate.registationRules(),
//     regValidate.checkRegData,
//     utilities.handleErrors(accountController.registerAccount)
// );

module.exports = router;