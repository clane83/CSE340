const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    try {
        const classification_id = parseInt(req.params.classificationId, 10);
        console.log(`Parsed classification_id in try: ${classification_id}, type: ${typeof classification_id}`);
        const data = await invModel.getInventoryByClassificationId(classification_id);
        const grid = await utilities.buildClassificationGrid(data);
        let nav = await utilities.getNav();
        if (data.length === 0) {
            // Fetch classification_name using invModel.getClassifications
            // console.log(`Fetching classifications for ID: ${classification_id}`);
            const classResult = await invModel.getClassifications();
            // console.log(`Classification query result in try: ${JSON.stringify(classResult.rows)}`);
            const classification = classResult.rows.find(row => row.classification_id === classification_id);
            if (!classification) {
                return res.status(404).render("./inventory/classification", {
                    title: "Classification Not Found",
                    message: `Classification ID ${classification_id} does not exist.`,
                    nav,
                    grid: "",
                });
            }
            const className = classification.classification_name;
            return res.render("./inventory/classification", {
                title: className + " vehicles",
                nav,
                grid,
                message: "No inventory at this time.",
            });
        }
        const className = data[0].classification_name;
        res.render("./inventory/classification", {
            title: className + " vehicles",
            nav,
            grid,
        });
    } catch (error) {
        console.error("Error in buildByClassificationId:", error.message, error.stack);
        let nav;
        try {
            nav = await utilities.getNav();
        } catch (navError) {
            console.error("Error fetching nav:", navError.message, navError.stack);
            nav = '<ul class="navigation"><li><a href="/" title="Home page">Home</a></li></ul>';
        }

        const classification_id = parseInt(req.params.classificationId, 10);
        console.log(`Parsed classification_id in catch: ${classification_id}, type: ${typeof classification_id}`);
        let title = "Classification Not Found";
        let message = "No inventory at this time.";

        if (!isNaN(classification_id) && classification_id > 0) {
            try {
                console.log(`Fetching classifications for ID: ${classification_id}`);
                const classResult = await invModel.getClassifications();
                console.log(`Classification query result in catch: ${JSON.stringify(classResult.rows)}`);
                const classification = classResult.rows.find(row => row.classification_id === classification_id);
                if (classification && classification.classification_name) {
                    title = `${classification.classification_name} vehicles`;
                } else {
                    console.log(`No classification found for ID: ${classification_id}`);
                    message = `Classification ID ${classification_id} does not exist.`;
                }
            } catch (queryError) {
                console.error("Error fetching classifications:", queryError.message, queryError.stack);
                message = `Unable to retrieve classification ID ${classification_id}: ${queryError.message}`;
            }
        } else {
            console.log(`Invalid classification ID received: ${req.params.classificationId}`);
            message = `Invalid classification ID: ${req.params.classificationId}`;
        }

        res.status(500).render("./inventory/classification", {
            title,
            message,
            nav,
            grid: "",
        });
    }
};

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagement = async (req, res) => {
    try {
        const nav = await utilities.getNav()
        const classificationSelect = await utilities.buildClassificationList() // ✅
        return res.render("inventory/management", {
            title: "Inventory Management",
            nav,
            classificationSelect, // ✅
            errors: null,
            messages: req.flash(),
        })
    } catch (err) {
        return next(err)
    }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    try {
        const raw = req.params.classification_id
        const id = Number(raw)

        // Validate id to prevent DB errors
        if (!Number.isFinite(id) || id <= 0) {
            console.warn("[getInventoryJSON] invalid id:", raw)
            return res.status(400).json({ error: "Invalid classification id" })
        }

        const data = await invModel.getInventoryByClassificationId(id)

        // Normalize to array regardless of driver shape
        const items = Array.isArray(data) ? data : (data?.rows ?? [])

        return res
            .type("application/json")
            .status(200)
            .json(items)
    } catch (err) {
        console.error("[getInventoryJSON] ERROR:", err?.message || err)
        return next(err) // utilities.handleErrors will format a 500
    }
}

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
        const nav = await utilities.getNav()
        const {
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        } = req.body
        console.log("Form data received in registerInventory:", {
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_price,
            inv_miles,
            inv_color,
            classification_id,
            environment: process.env.NODE_ENV,
            headers: req.headers['content-type']
        })

        // Validate required fields
        const missingFields = []
        if (!inv_make) missingFields.push("Make")
        if (!inv_model) missingFields.push("Model")
        if (!inv_year) missingFields.push("Year")
        if (!inv_price) missingFields.push("Price")
        if (!inv_miles) missingFields.push("Miles")
        if (!inv_color) missingFields.push("Color")
        if (!classification_id) missingFields.push("Classification")

        if (missingFields.length > 0) {
            console.log(`Validation failed: Missing fields: ${missingFields.join(", ")}`)
            req.flash("notice", `Missing required fields: ${missingFields.join(", ")}`)
            const { rows: classifications } = await invModel.getClassifications()
            return res.status(400).render("inventory/add_inventory", {
                title: "Add Inventory",
                nav,
                errors: [{ msg: `Missing required fields: ${missingFields.join(", ")}` }],
                classifications,
                inv_make: req.body.inv_make || "",
                inv_model: req.body.inv_model || "",
                inv_year: req.body.inv_year || "",
                inv_description: req.body.inv_description || "",
                inv_price: req.body.inv_price || "",
                inv_miles: req.body.inv_miles || "",
                inv_color: req.body.inv_color || "",
                classification_id: req.body.classification_id || ""
            })
        }

        // Validate numeric fields
        const year = Number(inv_year)
        const price = Number(inv_price)
        const miles = Number(inv_miles)
        const classId = Number(classification_id)

        if (isNaN(year) || isNaN(price) || isNaN(miles) || isNaN(classId)) {
            console.log("Validation failed: Invalid numeric values", { inv_year, inv_price, inv_miles, classification_id })
            req.flash("notice", "Year, price, miles, and classification must be valid numbers.")
            const { rows: classifications } = await invModel.getClassifications()
            return res.status(400).render("inventory/add_inventory", {
                title: "Add Inventory",
                nav,
                errors: [{ msg: "Year, price, miles, and classification must be valid numbers." }],
                classifications,
                inv_make: req.body.inv_make || "",
                inv_model: req.body.inv_model || "",
                inv_year: req.body.inv_year || "",
                inv_description: req.body.inv_description || "",
                inv_price: req.body.inv_price || "",
                inv_miles: req.body.inv_miles || "",
                inv_color: req.body.inv_color || "",
                classification_id: req.body.classification_id || ""
            })
        }

        // Validate classification_id exists
        const classResult = await invModel.getClassifications()
        console.log("Available classifications:", classResult.rows)
        const validClassification = classResult.rows.find(row => row.classification_id === classId)
        if (!validClassification) {
            console.log(`Validation failed: Invalid classification_id ${classId}`)
            req.flash("notice", `Invalid classification ID: ${classification_id}`)
            const { rows: classifications } = await invModel.getClassifications()
            return res.status(400).render("inventory/add_inventory", {
                title: "Add Inventory",
                nav,
                errors: [{ msg: `Invalid classification ID: ${classification_id}` }],
                classifications,
                inv_make: req.body.inv_make || "",
                inv_model: req.body.inv_model || "",
                inv_year: req.body.inv_year || "",
                inv_description: req.body.inv_description || "",
                inv_price: req.body.inv_price || "",
                inv_miles: req.body.inv_miles || "",
                inv_color: req.body.inv_color || "",
                classification_id: req.body.classification_id || ""
            })
        }

        console.log("Attempting to insert inventory with params:", {
            inv_make,
            inv_model,
            year,
            inv_description: inv_description || "",
            price,
            miles,
            inv_color,
            classId
        })

        const result = await invModel.addInventory(
            inv_make,
            inv_model,
            year,
            inv_description || "",
            price,
            miles,
            inv_color,
            classId
        )

        if (result && result.rows && result.rows.length > 0) {
            console.log("Inventory added successfully:", result.rows[0])
            req.flash("notice", "Inventory added successfully.")
            return res.redirect("/inv/")
        }

        console.log("No rows returned from addInventory")
        req.flash("notice", "Could not add inventory.")
        const { rows: classifications } = await invModel.getClassifications()
        return res.status(500).render("inventory/add_inventory", {
            title: "Add Inventory",
            nav,
            errors: [{ msg: "Failed to add inventory to the database." }],
            classifications,
            inv_make: req.body.inv_make || "",
            inv_model: req.body.inv_model || "",
            inv_year: req.body.inv_year || "",
            inv_description: req.body.inv_description || "",
            inv_price: req.body.inv_price || "",
            inv_miles: req.body.inv_miles || "",
            inv_color: req.body.inv_color || "",
            classification_id: req.body.classification_id || ""
        })
    } catch (err) {
        console.error("Error in registerInventory:", {
            message: err.message,
            code: err.code,
            stack: err.stack,
            environment: process.env.NODE_ENV
        })
        if (err.code === "23505") {
            req.flash("notice", "Inventory already exists.")
            const nav = await utilities.getNav()
            const { rows: classifications } = await invModel.getClassifications()
            return res.status(400).render("inventory/add_inventory", {
                title: "Add Inventory",
                nav,
                errors: [{ msg: "Inventory already exists." }],
                classifications,
                inv_make: req.body.inv_make || "",
                inv_model: req.body.inv_model || "",
                inv_year: req.body.inv_year || "",
                inv_description: req.body.inv_description || "",
                inv_price: req.body.inv_price || "",
                inv_miles: req.body.inv_miles || "",
                inv_color: req.body.inv_color || "",
                classification_id: req.body.classification_id || ""
            })
        }
        if (err.code === "23503") {
            console.log(`Foreign key violation: classification_id ${classification_id} not found`)
            req.flash("notice", "Invalid classification ID. Please select a valid classification.")
            const nav = await utilities.getNav()
            const { rows: classifications } = await invModel.getClassifications()
            return res.status(400).render("inventory/add_inventory", {
                title: "Add Inventory",
                nav,
                errors: [{ msg: "Invalid classification ID. Please select a valid classification." }],
                classifications,
                inv_make: req.body.inv_make || "",
                inv_model: req.body.inv_model || "",
                inv_year: req.body.inv_year || "",
                inv_description: req.body.inv_description || "",
                inv_price: req.body.inv_price || "",
                inv_miles: req.body.inv_miles || "",
                inv_color: req.body.inv_color || "",
                classification_id: req.body.classification_id || ""
            })
        }
        if (err.code === "23502") {
            console.log(`Null value violation: ${err.column || 'unknown column'} cannot be null`)
            req.flash("notice", `Database error: ${err.column || 'A required field'} cannot be null.`)
            const nav = await utilities.getNav()
            const { rows: classifications } = await invModel.getClassifications()
            return res.status(400).render("inventory/add_inventory", {
                title: "Add Inventory",
                nav,
                errors: [{ msg: `Database error: ${err.column || 'A required field'} cannot be null.` }],
                classifications,
                inv_make: req.body.inv_make || "",
                inv_model: req.body.inv_model || "",
                inv_year: req.body.inv_year || "",
                inv_description: req.body.inv_description || "",
                inv_price: req.body.inv_price || "",
                inv_miles: req.body.inv_miles || "",
                inv_color: req.body.inv_color || "",
                classification_id: req.body.classification_id || ""
            })
        }
        console.log("Unhandled database error in registerInventory")
        return next(err)
    }
}



module.exports = invCont;