// utilities/upgrade-validation.js
const { param, validationResult } = require('express-validator');
const utilities = require('../utilities');
const Util = {}


/**
 * Shared error handler for param validators.
 * If you prefer JSON for these errors, swap to res.status(400).json(...).
 */

Util.handleValidation = async function (req, res, next) {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const nav = await utilities.getNav();
    return res.status(400).render('inventory/upgrades', {
        title: 'Invalid request',
        nav,
        list: [],
        item: null,
        errors: errors.mapped(),
        layout: './layouts/vehicle',
    });
}


Util.validateTypeId = [
    param('type_id')
        .customSanitizer(v => String(v ?? '').trim())
        .matches(/^\d+$/).withMessage('type_id must be a positive integer')
        .bail()
        .toInt(),
    Util.handleValidation,
];

Util.validateUpInvId = [
    param('upInvId')
        .customSanitizer(v => String(v ?? '').trim())
        .matches(/^\d+$/).withMessage('upInvId must be a positive integer')
        .bail()
        .toInt(),
    Util.handleValidation,
];

module.exports = Util;