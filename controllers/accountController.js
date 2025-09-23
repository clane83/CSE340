// controllers/accountController.js
const utilities = require("../utilities");

const accountController = {};

accountController.buildLogin = async function (req, res) {
    const nav = await utilities.getNav(); // if your utilities provide this
    return res.render("account/login", { title: "Login", nav, errors: null });
};

/* ****************************************
*  Deliver registration view
* *************************************** */
accountController.buildRegister = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/registration", {
        title: "Register",
        nav,
        errors: null
    })
}

module.exports = accountController;
