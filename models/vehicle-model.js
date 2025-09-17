const pool = require("../database");

/* ***************************
 *  Get all classification data
 * ************************** */


async function getVehicle() {
    return await pool.query("SELECT * FROM public.inventory ORDER BY inv_id");
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */

async function getVehicleByInventoryId(inv_id) {
    try {
        const data = await pool.query(
            `SELECT i.*, c.classification_name
    FROM public.inventory AS i
    JOIN public.classification AS c
      ON i.classification_id = c.classification_id
    WHERE i.inv_id = $1`,
            [inv_id]
        )
        return data.rows
    } catch (error) {
        console.error("getvehiclebyinventoryid error " + error)
    }
}


module.exports = { getVehicle, getVehicleByInventoryId };