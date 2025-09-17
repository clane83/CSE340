const invModel = require("../models/vehicle-model")
const utilities = require("../utilities")

const invCont = {}

/* ***************************
 *  Build inventory by vehicle view
 * ************************** */

invCont.buildVehicle = async function (req, res, next) {
    const invId = Number(req.params.invId);

    const nav = await utilities.getNav();

    // your model function is getVehicleByInventoryId (returns rows array)
    const rows = await invModel.getVehicleByInventoryId(invId);
    const item = rows && rows[0]; // pick the single vehicle

    if (!item) {
        return res.status(404).render('errors/404', { nav, title: 'Not found' });
    }

    return res.render('inventory/detail', {
        title: `${item.inv_make} ${item.inv_model}`,
        nav,
        item,
        layout: './layouts/layout'
    });
};

module.exports = invCont;