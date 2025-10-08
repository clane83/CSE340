const invModel = require("../models/inventory-model")
const jwt = require('jsonwebtoken')
require('dotenv').config()
const Util = {}


/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    let list = '<ul class="navigation">'
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
    let grid = "";
    console.log("buildClassificationGrid data:", JSON.stringify(data, null, 2));
    if (data.length > 0) {
        grid = '<ul class="inv-display">';
        data.forEach(vehicle => {
            console.log("Vehicle:", JSON.stringify(vehicle, null, 2));
            const invId = vehicle.inv_id || "unknown";
            const invYear = vehicle.inv_year || "Unknown";
            const invMake = vehicle.inv_make || "Unknown";
            const invModel = vehicle.inv_model || "Unknown";
            const invThumbnail = vehicle.inv_thumbnail || "/images/no-image.png";
            const invPrice = vehicle.inv_price != null ? vehicle.inv_price : 0;
            grid += '<li>';
            grid += '<a href="../../inv/detail/' + invId
                + '" title="View ' + invMake + ' ' + invModel
                + ' details"><img src="' + invThumbnail
                + '" alt="Image of ' + invMake + ' ' + invModel
                + ' on CSE Motors" /></a>';
            grid += '<div class="namePrice">';
            grid += '<hr />';
            grid += '<h2>';
            grid += '<a href="../../inv/detail/' + invId + '" title="View '
                + invMake + ' ' + invModel + ' details">'
                + invMake + ' ' + invModel + '</a>';
            grid += '</h2>';
            grid += '<span>$'
                + new Intl.NumberFormat('en-US').format(invPrice) + '</span>';
            grid += '</div>';
            grid += '</li>';
        });
        grid += '</ul>';
    } else {
        grid += '<div class="no-inventory">No inventory at this time. Check back again soon.</div>';
    }
    console.log("buildClassificationGrid output:", grid);
    return grid;
}

/* **************************************
* error handling
* ************************************ */
Util.handleErrors = (fn) => {
    if (typeof fn !== "function") {
        throw new TypeError("handleErrors(...) needs a function, e.g. handleErrors(controller.action)")
    }
    return (req, res, next) => {
        try {
            const out = fn(req, res, next)
            return out && typeof out.then === "function" ? out.catch(next) : out
        } catch (err) { return next(err) }
    }
}


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {
        jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
            if (err) {
                req.flash("notice", "Please log in")  // add the key
                res.clearCookie("jwt")
                return res.redirect("/account/login")
            }
            res.locals.loggedIn = true              // camel I
            res.locals.account = {                  // normalize for views
                account_id: accountData.account_id,
                account_firstname: accountData.account_firstname,
                account_lastname: accountData.account_lastname,
                account_email: accountData.account_email,
                account_type: accountData.account_type,
            }
            res.locals.accountData = res.locals.account // backwards compat
            return next()
        })
    } else {
        res.locals.loggedIn = false
        res.locals.account = null
        res.locals.accountData = null
        return next()
    }
}

/* ****************************************
 * Build <select> for classifications
 * (reused by Add New Inventory + Management)
 * *************************************** */
Util.buildClassificationList = async function (selectedId = null) {
    const res = await invModel.getClassifications()
    const rows = res?.rows ?? []

    // Use the ID expected by your client JS:
    let html = '<select id="classificationList" name="classification_id" required>'
    html += '<option value="">Select…</option>'
    for (const c of rows) {
        const sel = Number(selectedId) === Number(c.classification_id) ? " selected" : ""
        html += `<option value="${c.classification_id}"${sel}>${c.classification_name}</option>`
    }
    html += '</select>'
    return html
}


module.exports = Util;