const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registationRules = () => {
    return [
        // firstname is required and must be string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty().withMessage("Please provider a first name.")
            .bail()//stops if empty
            .isLength({ min: 1 })
            .withMessage("Please provide a first name."), // on error this message is sent.

        // lastname is required and must be string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty().withMessage("Please provide a last name.")
            .bail() //stops if empty
            .isLength({ min: 2 })
            .withMessage("Please provide a last name."), // on error this message is sent.

        // valid email is required and cannot already exist in the DB
        body("account_email")
            .trim()
            .escape()
            .notEmpty().withMessage("A valid email is required.")
            .bail()
            .isEmail()
            .normalizeEmail() // refer to validator.js docs
            .withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email)
                if (emailExists) {
                    throw new Error("Email exists. Please log in or use different email")
                }
            }),


        // password is required and must be strong password
        body("account_password")
            .trim()
            .notEmpty().withMessage("Password does not meet requirements.")
            .bail()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ]
}


/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        errors.array().forEach(e => req.flash("notice", e.msg))
        let nav = await utilities.getNav()
        return res.status(400).render("account/registration", {
            title: "Registration",
            nav,
            errors: errors.array(),
            account_firstname: req.body.account_firstname,
            account_lastname: req.body.account_lastname,
            account_email: req.body.account_email,
        })
    }
    next()
}


validate.loginRules = () => [
    body("account_email")
        .trim()
        .notEmpty().withMessage("Email is required.")
        .bail()
        .isEmail().withMessage("Enter a valid email."),
    body("account_password")
        .trim()
        .notEmpty().withMessage("Password is required."),
]

// Handle login validation result
validate.checkLoginData = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        // flash each error so <%- messages() %> shows them
        errors.array().forEach(e => req.flash("notice", e.msg))
        const nav = await utilities.getNav()
        return res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: errors.array(),              // optional if you also list them manually
            account_email: req.body.account_email, // sticky value
        })
    }
    next()
}



module.exports = validate