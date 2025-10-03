// Needed Resources 
const express = require("express")
const router = express.Router()
const utilities = require('../utilities/index');
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation')



/******************
 * Login / Registration Routes
 ******************/
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/registration", utilities.handleErrors(accountController.buildRegister));


/******************
 * Management view
******************/
router.get("/", utilities.handleErrors(accountController.buildManagement))


/******************
 * Registration
 ******************/
router.post(
    "/registration",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

/******************
 * Login
 ******************/
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.loginAccount)
)


/******************
 * Update account UI
 ******************/
router.get(
    "/update/:account_id",
    regValidate.requireLogin,
    utilities.handleErrors(accountController.buildUpdateView)
)


router.post(
    "/update",
    regValidate.updateAccountRules(),
    regValidate.checkEmailChangeUnique,
    utilities.handleErrors(accountController.handleAccountUpdate) // <-- undefined
)

router.post(
    "/update-password",
    regValidate.updatePasswordRules(),
    utilities.handleErrors(accountController.handlePasswordChange) // <-- undefined
)


console.log("typeof accountController.logout =", typeof accountController.logout) // should be 'function'

/******************
 * Logout
 ******************/
router.post(
    "/logout",
    utilities.handleErrors(accountController.logout)
)

module.exports = router;