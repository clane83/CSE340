const invModel = require("../models/inventory-model")
const { body, validationResult } = require("express-validator");
const utilities = require("../utilities");
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
* Build the inventory view HTML
* ************************************ */
Util.buildVehicleDetailGrid = async function (data) {
    let grid
    if (data.length > 0) {
        grid = '" title="View ' + vehicle.inv_year + ' ' + vehicle.inv_make + ' ' + vehicle.inv_model
            + 'details"><img src="' + vehicle.inv_thumbnail
            + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
            + ' on CSE Motors" /></a>'
        grid += '<div class="vehicle-detail">'
        grid += '<h2>' + vehicle.inv_make + ' ' + vehicle.inv_model + 'Detail'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
            + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
            + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span><strong>Price:</strong> $' +
            new Intl.NumberFormat("en-US").format(vehicle.inv_price) + '</span>';
        grid += '<span><strong>Description:</strong> ' + inv_description + '</span>';
        grid += '<span><strong>Color:</strong> ' + inv_color + '</span>';
        grid += '<span><strong>Miles:</strong> ' + inv_miles + '</span>';
        grid += '</div>'

    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

Util.addClassificationRules = () => [
    body("classification_name")
        .trim()
        .notEmpty().withMessage("Provide a correct Classification Name.")
        .bail()
        .isLength({ min: 2 }).withMessage("Provide a correct Classification Name."),
];

// Validate result and re-render on error
Util.checkAddClassData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(e => req.flash("notice", e.msg));
        const nav = await utilities.getNav();
        return res.status(400).render("inventory/add_classification", {
            title: "Add Classification",
            nav,
            errors: errors.array(),
            classification_name: req.body.classification_name || "",
        });
    }
    next();
};




module.exports = Util;