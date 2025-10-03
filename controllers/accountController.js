// controllers/accountController.js
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config()

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
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
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

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10); //hash password masks it in the table

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword //store hashedPassword vs what the user enters
    );

    if (regResult && regResult.rowCount === 1) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.status(201).render("account/login", { title: "Login", nav, errors: [] });
    }

    req.flash("notice", "Sorry, the registration failed.");
    return res.status(400).render("account/registration", {
      title: "Registration",
      nav,
      errors: [],
      account_firstname,
      account_lastname,
      account_email,
    });
  } catch (err) {
    console.error(err);
    req.flash("notice", "Unexpected error during registration.");
    return res.status(500).render("account/registration", {
      title: "Registration",
      nav,
      errors: [],
      account_firstname,
      account_lastname,
      account_email,
    });
  }
};

/* ****************************************
 *  Process login request
 * ************************************ */
accountController.buildManagement = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()

    // set by utilities.checkJWTToken
    const user = res.locals.accountData
    if (!user) {
      req.flash('notice', 'Please log in')
      return res.redirect('/account/login')
    }

    let account = user
    try {
      const row = await accountModel.getById(user.account_id)
      if (row) account = row
    } catch (_) { /* ignore */ }

    return res.render('account/management', {
      title: 'Account Management',
      nav,
      account,
      messages: req.flash(),
    })
  } catch (error) {
    return next(error)
  }
}

/* ****************************************
 *  update account view
 * ************************************ */
accountController.buildUpdateView = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    const { account_id } = req.params
    const account = await accountModel.getById(account_id)
    if (!account) {
      req.flash("notice", "Account not found.")
      return res.redirect("/account/management")
    }
    return res.render("account/update", {
      title: "Update Account",
      nav,
      account,
    })
  } catch (err) { return next(err) }
}

/* ****************************************
 *  process account view
 * ************************************ */
accountController.handleAccountUpdate = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    const { account_id, account_firstname, account_lastname, account_email } = req.body

    const result = await accountModel.updateAccount({
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })

    if (result && result.rowCount === 1) {
      // refresh JWT so header reflects updated name/email
      const fresh = await accountModel.getById(account_id)
      const jwt = require("jsonwebtoken")
      const token = jwt.sign({
        account_id: fresh.account_id,
        account_firstname: fresh.account_firstname,
        account_lastname: fresh.account_lastname,
        account_email: fresh.account_email,
        account_type: fresh.account_type,
      }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
      res.cookie("jwt", token, { httpOnly: true, secure: process.env.NODE_ENV !== "development" })

      req.flash("notice", "Account updated successfully.")
      return res.redirect("/account/management")
    }

    req.flash("notice", "No changes were made.")
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      account: { account_id },
      form: { account_firstname, account_lastname, account_email },
    })
  } catch (err) { return next(err) }
}

/* ****************************************
 *  Process password change
 * ************************************ */
accountController.handlePasswordChange = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    const { account_id, account_password } = req.body

    const hash = await bcrypt.hash(account_password, 10)
    const result = await accountModel.updatePassword({ account_id, password_hash: hash })

    if (result && result.rowCount === 1) {
      req.flash("notice", "Password updated successfully.")
      return res.redirect("/account/management")
    }

    req.flash("notice", "Password update failed.")
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      account: { account_id },
    })
  } catch (err) { return next(err) }
}


/* ****************************************
 *  Process logout request
 * ************************************ */
accountController.logout = async (req, res) => {
  res.clearCookie("jwt", { httpOnly: true, secure: process.env.NODE_ENV !== "development" })
  req.flash("notice", "You have been logged out.")
  return res.redirect("/")
}

module.exports = accountController;
