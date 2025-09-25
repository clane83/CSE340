const { body, validationResult } = require("express-validator");
const utilities = require("../utilities");
const Util = {};

// Validation rules
Util.addClassificationRules = () => [
    body("classification_name")
        .trim()
        .notEmpty().withMessage("Provide a correct Classification Name.")
        .bail()
        .isLength({ min: 2 }).withMessage("Provide a correct Classification Name."),
];

// Check result
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
];

// Check result
Util.checkAddVehicleData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(e => req.flash("notice", e.msg));
        const nav = await utilities.getNav();
        return res.status(400).render("inventory/add_inventory", {
            title: "Add Vehicle",
            nav,
            errors: errors.array(),
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

module.exports = Util;