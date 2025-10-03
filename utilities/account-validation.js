const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
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


validate.attachAuthLocals = async (req, res, next) => {
    try {
        const token = req.cookies?.jwt
        if (!token) {
            res.locals.loggedIn = false
            res.locals.account = null
            return next()
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        res.locals.loggedIn = true
        res.locals.account = {
            account_id: decoded.account_id,
            account_firstname: decoded.account_firstname,
            account_type: decoded.account_type,
            account_email: decoded.account_email,
        }
        return next()
    } catch (e) {
        // treat as logged out, and clear the bad cookie
        res.clearCookie("jwt", { httpOnly: true, secure: process.env.NODE_ENV !== "development" })
        res.locals.loggedIn = false
        res.locals.account = null
        return next()
    }
}

validate.requireEmployeeOrAdmin = async (req, res, next) => {
    try {
        const token = req.cookies?.jwt
        if (!token) throw new Error("No token")
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const allowed = decoded.account_type === "Employee" || decoded.account_type === "Admin"
        if (!allowed) {
            req.flash("notice", "You must be logged in as Employee or Admin to access Inventory Management.")
            return res.status(401).render("account/login", { title: "Login" })
        }
        // Stash decoded on req for controllers if helpful
        req.account = decoded
        return next()
    } catch (err) {
        req.flash("notice", "Please log in to continue.")
        return res.status(401).render("account/login", { title: "Login" })
    }
}


validate.requireLogin = (req, res, next) => {
    const user = res.locals.account || res.locals.accountData
    if (!user) {
        req.flash("notice", "Please log in.")
        return res.redirect("/account/login")
    }
    next()
}

// --- update account rules (Task 5) ---
validate.updateAccountRules = () => ([
    body("account_firstname").trim().notEmpty().withMessage("First name is required."),
    body("account_lastname").trim().notEmpty().withMessage("Last name is required."),
    body("account_email").trim().isEmail().withMessage("A valid email is required."),
    body("account_id").toInt().isInt().withMessage("Invalid account id."),
])

// ensure unique email if changed
validate.checkEmailChangeUnique = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        errors.array().forEach(e => req.flash("notice", e.msg))
        const nav = await utilities.getNav()
        return res.status(400).render("account/update", {
            title: "Update Account",
            nav,
            account: { account_id: req.body.account_id },
            form: {
                account_firstname: req.body.account_firstname,
                account_lastname: req.body.account_lastname,
                account_email: req.body.account_email,
            },
        })
    }

    const { account_id, account_email } = req.body
    try {
        const existing = await accountModel.getByEmail(account_email)
        if (existing && Number(existing.account_id) !== Number(account_id)) {
            req.flash("notice", "That email is already in use.")
            const nav = await utilities.getNav()
            return res.status(400).render("account/update", {
                title: "Update Account",
                nav,
                account: { account_id },
                form: {
                    account_firstname: req.body.account_firstname,
                    account_lastname: req.body.account_lastname,
                    account_email,
                },
            })
        }
        next()
    } catch (err) {
        next(err)
    }
}

// --- update password rules (Task 5) ---
validate.updatePasswordRules = () => ([
    body("account_id").toInt().isInt().withMessage("Invalid account id."),
    body("account_password")
        .isLength({ min: 12 }).withMessage("Password must be at least 12 characters.")
        .matches(/[a-z]/).withMessage("Password must include a lowercase letter.")
        .matches(/[A-Z]/).withMessage("Password must include an uppercase letter.")
        .matches(/[0-9]/).withMessage("Password must include a number.")
        .matches(/[^A-Za-z0-9]/).withMessage("Password must include a symbol."),
])


module.exports = validate