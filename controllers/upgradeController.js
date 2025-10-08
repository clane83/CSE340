const upgradeModel = require("../models/upgrade-model");
const utilities = require("../utilities");


const upgradeCtrl = {};

// /upgrade/type/:type_id  → list
upgradeCtrl.listByType = async (req, res, next) => {
    try {
        const typeId = Number(req.params.type_id);
        const nav = await utilities.getNav();

        const list = await upgradeModel.getInventoryByUpgradeId(typeId);

        let typeName = 'Upgrades';
        if (Array.isArray(list) && list.length > 0) {
            typeName = list[0].up_type ?? 'Upgrades';
        } else {
            // fetch the type label so the heading is meaningful even with no rows
            try {
                const t = await upgradeModel.getTypeNameById(typeId);
                if (t) typeName = t;
            } catch (e) {
                console.warn('[upgrade] getTypeNameById failed:', e.message);
            }
        }

        return res.render('inventory/upgrades', {
            title: typeName,
            nav,
            list: Array.isArray(list) ? list : [],
            layout: './layouts/vehicle',
        });
    } catch (e) { next(e); }
};

/* ***************************
 *  Build inventory by upgrade view
 * ************************** */
upgradeCtrl.buildUpgrade = async (req, res, next) => {
    try {
        const upInvId = Number(req.params.upInvId);
        const nav = await utilities.getNav();

        if (!Number.isFinite(upInvId)) {
            return res.status(400).render("inventory/upgrades", {
                title: "Invalid request", nav, list: [], item: null, layout: "./layouts/vehicle",
            });
        }

        console.log("[upgrade][controller] fetching item upInvId =", upInvId);
        const rows = await upgradeModel.getMonsterTruckUpgradeId(upInvId);
        console.log("[upgrade][controller] rows length =", Array.isArray(rows) ? rows.length : "not array");

        const item = rows && rows[0];
        if (!item) {
            return res.status(404).render("inventory/upgrades", {
                title: "Not found",
                nav,
                list: [],
                item: null,
                layout: "./layouts/vehicle",
            });
        }

        return res.render("inventory/upgrades", {
            title: item.up_inv_item, nav, list: [], item, layout: "./layouts/vehicle",
        });
    } catch (e) { next(e); }
};

module.exports = upgradeCtrl;
