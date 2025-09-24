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

module.exports = Util;