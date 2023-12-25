var express = require('express');
var router = express.Router();
const productCtrl = require('../../src/controllers/product');

router.post('/', productCtrl.createVariantCode);
router.get('/', productCtrl.getVariantCodes);
router.get('/:id', productCtrl.getVariantCode);
router.put('/:id', productCtrl.updateVariantCode);
router.delete('/:id', productCtrl.deleteVariantCode);

module.exports = router;