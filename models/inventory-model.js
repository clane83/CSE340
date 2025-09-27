const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");

};


/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const sql = `INSERT INTO inventory (
            inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id, inv_thumbnail, inv_image
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`
        const result = await pool.query(sql, [
            inv_make,
            inv_model,
            inv_year,
            inv_description || "",
            inv_price,
            inv_miles,
            inv_color,
            classification_id,
            "/images/no-image.png",
            "/images/no-image.png"
        ])
        console.log("addInventory result:", result.rows)
        return result
    } catch (error) {
        console.error("addInventory error:", {
            message: error.message,
            code: error.code,
            stack: error.stack,
            params: [inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id]
        })
        throw error
    }
}


/* *****************************
*   Add new classification
* *************************** */
async function addClassification(classification_name) {
    try {
        const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
        return await pool.query(sql, [classification_name])
    } catch (error) {
        throw error.message
    }
}


/* *****************************
*   Add new inventory
* *************************** */
async function addInventory(inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id) {
    console.log("addInventory params:", { inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id }); //debugging why inv_model is null
    try {
        const sql = "INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *"
        return await pool.query(sql, [inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id])
    } catch (error) {
        throw error.message
    }
}



module.exports = { getClassifications, getInventoryByClassificationId, addClassification, addInventory };