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

// Validation rules
Util.addVehicleRules = () => [
    body("inv_make")
        .trim()
        .notEmpty().withMessage("Provide a Make.")
        .bail()
        .isLength({ min: 2 }).withMessage("Provide a Make."),
    body("inv_model")
        .trim()
        .notEmpty().withMessage("Provide a Model.")
        .bail()
        .isLength({ min: 2 }).withMessage("Provide a Model."),
    body("inv_year")
        .trim()
        .notEmpty().withMessage("Provide a Year.")
        .bail()
        .isLength({ min: 2 }).withMessage("Provide a Year."),
    body("inv_description")
        .trim()
        .notEmpty().withMessage("Provide a Description.")
        .bail()
        .isLength({ min: 2 }).withMessage("Provide a Description."),
    body("inv_price")
        .trim()
        .notEmpty().withMessage("Provide a Price.")
        .bail()
        .isLength({ min: 2 }).withMessage("Provide a Price."),
    body("inv_miles")
        .trim()
        .notEmpty().withMessage("Provide a Miles.")
        .bail()
        .isLength({ min: 2 }).withMessage("Provide a Miles."),
    body("inv_color")
        .trim()
        .notEmpty().withMessage("Provide a Color.")
        .bail()
        .isLength({ min: 2 }).withMessage("Provide a Color."),
    body("classification_id")
        .trim()
        .notEmpty().withMessage("Choose a classification.")
        .bail()
        .isLength().withMessage("Choose a classification"),
    
];

// Check result
Util.checkAddVehicleData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(e => req.flash("notice", e.msg));
        const nav = await utilities.getNav();
        const { rows: classifications } = await invModel.getClassifications();
        return res.status(400).render("inventory/add_inventory", {
            title: "Add Vehicle",
            nav,
            errors: errors.array(),
            classifications,
            inv_make: req.body.inv_make,
            inv_model: req.body.inv_model,
            inv_year: req.body.inv_year,
            inv_description: req.body.inv_description,
            inv_price: req.body.inv_price,
            inv_miles: req.body.inv_miles,
            inv_color: req.body.inv_color
        });
    }
    next();
};


// Validate the update form
Util.updateVehicleRules = () => [
    body("inv_make").trim().notEmpty().withMessage("Provide a Make."),
    body("inv_model").trim().notEmpty().withMessage("Provide a Model."),
    body("inv_year").isInt({ min: 1886, max: 3000 }).withMessage("Provide a valid Year."),
    body("inv_price").isFloat({ min: 0 }).withMessage("Provide a valid Price."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Provide valid Miles."),
    body("inv_color").trim().notEmpty().withMessage("Provide a Color."),
    body("classification_id").isInt({ min: 1 }).withMessage("Choose a classification."),
    body("inv_id").isInt({ min: 1 }).withMessage("Missing inventory id."),
]

// On validation error, re-render the EDIT view with posted values
Util.checkUpdateVehicleData = async (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) return next()

    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(req.body.classification_id)

    return res.status(400).render("inventory/edit-inventory", {
        title: "Edit Vehicle",
        nav,
        classificationSelect,
        errors: errors.array(),
        ...req.body, // inv_id, inv_make, inv_model, etc.
    })
}

module.exports = Util;