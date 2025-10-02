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
      SELECT
        i.inv_id,
        i.inv_make,
        i.inv_model,
        i.inv_year,
        i.inv_price,
        i.inv_miles,
        i.inv_thumbnail,
        c.classification_name
      FROM public.inventory i
      JOIN public.classification c
        ON c.classification_id = i.classification_id
      WHERE i.classification_id = $1::int
      ORDER BY i.inv_make, i.inv_model, i.inv_year
    `;
        const { rows } = await pool.query(sql, [classification_id])
        return rows; // <-- return an array
    } catch (err) {
        console.error("[inventory-model] getInventoryByClassificationId:", err)
        throw err
    }
}


/* ***************************
 *  Get all inventory by inv_id
 * ************************** */
async function getInventoryById(inv_id) {
    try {
        const sql = `
      SELECT inv_id, inv_make, inv_model, inv_year, inv_description,
             inv_price, inv_miles, inv_color, classification_id
      FROM public.inventory
      WHERE inv_id = $1`
        const { rows } = await pool.query(sql, [inv_id])
        return rows[0] || null
    } catch (err) {
        console.error("[inventory-model] getInventoryById:", err)
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

/* *****************************
*   update inventory
* *************************** */
async function updateInventory({
    inv_id, inv_make, inv_model, inv_year,
    inv_description, inv_price, inv_miles, inv_color, classification_id
}) {
    try {
        const sql = `
      UPDATE public.inventory
         SET inv_make=$1,
             inv_model=$2,
             inv_year=$3,
             inv_description=$4,
             inv_price=$5,
             inv_miles=$6,
             inv_color=$7,
             classification_id=$8
       WHERE inv_id=$9
       RETURNING inv_id`
        const params = [
            inv_make,
            inv_model,
            Number(inv_year),
            inv_description ?? "",
            Number(inv_price),
            Number(inv_miles),
            inv_color ?? "",
            Number(classification_id),
            Number(inv_id),
        ]
        const { rows } = await pool.query(sql, params)
        return rows[0] || null
    } catch (err) {
        console.error("[inventory-model] updateInventory:", err)
        throw err
    }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
    try {
        const sql = "DELETE FROM public.inventory WHERE inv_id = $1"
        const data = await pool.query(sql, [inv_id])
        return data.rowCount // 1 on success, 0 if not found
    } catch (error) {
        console.error("[inventory-model] deleteInventoryItem:", error)
        throw error
    }
}



module.exports = {
    getClassifications, getInventoryByClassificationId, addClassification, addInventory
    , getInventoryById, updateInventory, deleteInventoryItem
};