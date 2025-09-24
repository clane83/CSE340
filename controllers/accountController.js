// controllers/accountController.js
const utilities = require("../utilities");
const accountModel = require("../models/account-model");

const accountController = {};

/* ****************************************
*  Deliver Login view
* *************************************** */

accountController.buildLogin = async function (req, res) {
    const nav = await utilities.getNav(); // if your utilities provide this
    // req.flash("notice", "This is a flash message.")
    return res.render("account/login", { title: "Login", nav, errors: null });
};


/* ****************************************
*  Process Login
* *************************************** */

accountController.loginAccount = async (req, res) => {
    const nav = await utilities.getNav()
    const { account_email /*, account_password*/ } = req.body

    // TODO: replace with real check (e.g., accountModel.verifyPassword(...))
    const ok = true // <- stub result

    if (ok) {
        req.flash("notice", `Welcome back, ${account_email}.`)
        return res.redirect("/") // or render a dashboard
    } else {
        req.flash("notice", "Invalid email or password.")
        return res.status(401).render("account/login", {
            title: "Login",
            nav,
            account_email, // keep what the user typed
        })
    }
}


/* ****************************************
*  Deliver registration view
* *************************************** */
accountController.buildRegister = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/registration", {
        title: "Register",
        nav,
        errors: []
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
accountController.registerAccount = async function (req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    const regResult = await accountModel(
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: []
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/registration", {
            title: "Registration",
            nav,
            errors: []
        })
    }
}




module.exports = accountController;
