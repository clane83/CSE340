const pool = require("../database");

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByUpgradeId(type_id) {
  try {
    const sql = `
    SELECT
      i.up_inv_id,
      i.up_inv_item,
      i.up_inv_price,
      i.up_inv_thumbnail,
      t.up_type
    FROM public.upgradeinventory AS i
    JOIN public.upgradetype     AS t
      ON i.up_type_id = t.type_id
    WHERE i.up_type_id = $1::int
    ORDER BY i.up_inv_item
  `;
    const { rows } = await pool.query(sql, [type_id]);
    return rows;
  } catch (err) {
    console.error("[upgrade-model] getInventoryByUpgradeId:", err)
    throw err
  }
}

/* ***************************
 *  Get all Monster Truck Upgrades items and type_name by type_id
 * ************************** */

async function getMonsterTruckUpgradeId(up_inv_id) {
  try {
    const sql = `
    SELECT
      i.up_inv_id,
      i.up_inv_item,
      i.up_inv_price,
      i.up_inv_thumbnail,
      i.up_inv_description,
      t.up_type
    FROM public.upgradeinventory AS i
    JOIN public.upgradetype     AS t
      ON i.up_type_id = t.type_id
    WHERE i.up_inv_id = $1::int
  `;
    console.log("[upgrade][model] detail SQL up_inv_id =", up_inv_id);
    const { rows } = await pool.query(sql, [up_inv_id]);
    return rows;

  } catch (error) {
    console.error("[upgrade-model] getMonsterTruckUpgradeId:", error);
    throw error;
  }
}

async function getTypeNameById(type_id) {
  const { rows } = await pool.query(
    `SELECT up_type FROM public.upgradetype WHERE type_id = $1::int LIMIT 1`,
    [type_id]
  );
  return rows[0]?.up_type || null;
}


module.exports = { getMonsterTruckUpgradeId, getInventoryByUpgradeId, getTypeNameById };