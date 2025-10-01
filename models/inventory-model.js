const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
    try {
        const sql = `
      SELECT classification_id, classification_name
      FROM public.classification
      ORDER BY classification_name`
        const { rows } = await pool.query(sql)
        return { rows } // keeps existing callers that use data.rows
    } catch (err) {
        console.error("[inventory-model] getClassifications:", err)
        throw err
    }
}


/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const sql = `
      SELECT inv_id, inv_make, inv_model, inv_year, inv_price, inv_miles
      FROM public.inventory
      WHERE classification_id = $1
      ORDER BY inv_make, inv_model, inv_year`
        const { rows } = await pool.query(sql, [classification_id])
        return { rows } // <-- same shape as before
    } catch (err) {
        console.error("[inventory-model] getInventoryByClassificationId:", err)
        throw err
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