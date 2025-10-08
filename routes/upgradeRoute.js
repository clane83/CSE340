const express = require("express");
const router = express.Router();
const upgradeController = require("../controllers/upgradeController");
const utilities = require("../utilities");
const { validateTypeId, validateUpInvId } = require("../utilities/upgrade-validation");

router.get('/type/:type_id',
    (req, _res, next) => { console.log('[upgrade] type_id =', req.params.type_id); next(); },
    validateTypeId,
    utilities.handleErrors(upgradeController.listByType)
);

router.get(
    "/item/:upInvId",
    (req, _res, next) => { console.log('[upgrade] upInvId =', req.params.upInvId); next(); },
    validateUpInvId,
    utilities.handleErrors(upgradeController.buildUpgrade)
);


module.exports = router;
