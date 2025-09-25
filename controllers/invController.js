const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    // req.flash("notice", "This is a flash message.")
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
}

// management hub
invCont.buildManagement = async (req, res) => {
    const nav = await utilities.getNav();
    res.render("inventory/management", { title: "Management", nav });
};

// GET add-classification form
invCont.buildAddClassification = async (req, res) => {
    const nav = await utilities.getNav();
    res.render("inventory/add_classification", { title: "Add Classification", nav, errors: [] });
};

// POST add-classification
invCont.registerClassification = async (req, res, next) => {
    try {
        const nav = await utilities.getNav();
        const { classification_name } = req.body;

        const result = await invModel.addClassification(classification_name);

        // If your DB returns rows on success:
        if (result && result.rows) {
            req.flash("notice", "Classification added.");
            return res.redirect("/inv/");
        }

        // Fallback if model returned a string error
        req.flash("notice", "Could not add classification.");
        return res.status(500).render("inventory/add_classification", {
            title: "Add Classification",
            nav,
            errors: [],
            classification_name,
        });
    } catch (err) {
        // Handle PG unique violation gracefully
        if (err.code === "23505") {
            req.flash("notice", "Classification already exists.");
            const nav = await utilities.getNav();
            return res.status(400).render("inventory/add_classification", {
                title: "Add Classification",
                nav,
                errors: [],
                classification_name: req.body.classification_name || "",
            });
        }
        return next(err);
    }
};


// GET add-inventory form
invCont.buildAddInventory = async (req, res) => {
    try {
        const nav = await utilities.getNav();
        const { rows: classifications } = await invModel.getClassifications(); // returns rows
        res.render("inventory/add_inventory", {
            title: "Add Inventory",
            nav,
            errors: [],
            classifications,
            // sticky:
            classification_id: req.body?.classification_id || "",
            // ...other stickies if you have them
        });
    } catch (err) {
        next(err);
    }
};


// POST add-inventory
invCont.registerInventory = async (req, res, next) => {
    try {
        const nav = await utilities.getNav();
        const { classification_name } = req.body;

        const result = await invModel.addClassification(classification_name);

        // If your DB returns rows on success:
        if (result && result.rows) {
            req.flash("notice", "Inventory added.");
            return res.redirect("/inv/");
        }

        // Fallback if model returned a string error
        req.flash("notice", "Could not add classification.");
        return res.status(500).render("inventory/add_inventory", {
            title: "Add Inventory",
            nav,
            errors: [],
            classification_name,
        });
    } catch (err) {
        // Handle PG unique violation gracefully
        if (err.code === "23505") {
            req.flash("notice", "Classification already exists.");
            const nav = await utilities.getNav();
            return res.status(400).render("inventory/add_classification", {
                title: "Add Classification",
                nav,
                errors: [],
                classification_name: req.body.classification_name || "",
            });
        }
        return next(err);
    }
};

module.exports = invCont;