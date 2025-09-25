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
invCont.buildAddInventory = async (req, res, next) => {
    try {
        const nav = await utilities.getNav();
        const { rows: classifications } = await invModel.getClassifications(); // returns rows
        res.render("inventory/add_inventory", {
            title: "Add Inventory",
            nav,
            errors: [],
            classifications,
            classification_id: "",

        });
    } catch (err) {
        next(err);
    }
};


// POST add-inventory
invCont.registerInventory = async (req, res, next) => {
    try {
        const nav = await utilities.getNav();
        const {
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_price,
            inv_miles,
            inv_color,
            classification_id,
        } = req.body;
        console.log("req.body:", req.body);
        console.log("inv_model:", inv_model);

        const result = await invModel.addInventory(
            inv_make,                 // $1  inv_make
            inv_model,                // $2  inv_model  
            Number(inv_year),         // $3  inv_year
            inv_description,          // $4  inv_description
            Number(inv_price),        // $5  inv_price
            Number(inv_miles),        // $6  inv_miles   
            inv_color,                // $7  inv_color
            Number(classification_id) // $8
            );

        if (result && result.rows) {
            req.flash("notice", "Inventory added.");
            return res.redirect("/inv/");
        }

        req.flash("notice", "Could not add inventory.");
        const { rows: classifications } = await invModel.getClassifications();
        return res.status(500).render("inventory/add_inventory", {
            title: "Add Inventory",
            nav,
            errors: [],
            classifications,
            inv_make: req.body.inv_make || "",
            inv_model: req.body.inv_model || "",
            inv_year: req.body.inv_year || "",
            inv_description: req.body.inv_description || "",
            inv_price: req.body.inv_price || "",
            inv_miles: req.body.inv_miles || "",
            inv_color: req.body.inv_color || "",
            classification_id: req.body.classification_id || "",
        });
    } catch (err) {
        if (err.code === "23505") {
            req.flash("notice", "Inventory already exists.");
            const nav = await utilities.getNav();
            const { rows: classifications } = await invModel.getClassifications();
            return res.status(400).render("inventory/add_inventory", {
                title: "Add Inventory",
                nav,
                errors: [],
                classifications,
                inv_make: req.body.inv_make || "",
                inv_model: req.body.inv_model || "",
                inv_year: req.body.inv_year || "",
                inv_description: req.body.inv_description || "",
                inv_price: req.body.inv_price || "",
                inv_miles: req.body.inv_miles || "",
                inv_color: req.body.inv_color || "",
                classification_id: req.body.classification_id || "",
            });
        }
        return next(err);
    }
};

module.exports = invCont;