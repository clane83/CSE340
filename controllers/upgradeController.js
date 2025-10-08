// controllers/upgradeController.js
const upgradeModel = require("../models/upgrade-model");
const utilities = require("../utilities");

const upgradeCtrl = {};

// /upgrade/type/:type_id  → LIST
upgradeCtrl.listByType = async (req, res, next) => {
    try {
        const typeId = Number(req.params.type_id);
        const nav = await utilities.getNav();

        const list = await upgradeModel.getInventoryByUpgradeId(typeId);

        // get a friendly title even when empty
        let typeName = 'Upgrades';
        if (Array.isArray(list) && list.length) {
            typeName = list[0].up_type ?? 'Upgrades';
        } else if (typeof upgradeModel.getTypeNameById === 'function') {
            try { typeName = (await upgradeModel.getTypeNameById(typeId)) || 'Upgrades'; } catch { }
        }

        return res.render("inventory/upgrade-list", { // ✅ list view
            title: typeName,
            nav,
            list: Array.isArray(list) ? list : [],
            layout: "./layouts/layout",
        });
    } catch (e) { next(e); }
};

// /upgrade/item/:upInvId  → DETAIL
upgradeCtrl.buildUpgrade = async (req, res, next) => {
    try {
        const upInvId = Number(req.params.upInvId);
        const nav = await utilities.getNav();

        if (!Number.isFinite(upInvId)) {
            return res.status(400).render("inventory/upgrades", { // ✅ detail view
                title: "Invalid request",
                nav,
                item: null,
                layout: "./layouts/vehicle",
            });
        }

        const rows = await upgradeModel.getMonsterTruckUpgradeId(upInvId);
        const item = rows && rows[0];

        if (!item) {
            return res.status(404).render("inventory/upgrades", { // ✅ detail view
                title: "Not found",
                nav,
                item: null,
                layout: "./layouts/vehicle",
            });
        }

        return res.render("inventory/upgrades", { // ✅ detail view
            title: item.up_inv_item,
            nav,
            item,
            layout: "./layouts/vehicle",
        });
    } catch (e) { next(e); }
};

module.exports = upgradeCtrl;
