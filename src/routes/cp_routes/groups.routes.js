const router = require('express').Router();
const ctrl   = require('../../controllers/cp_controllers/groups.controller');

router.get('/',           ctrl.list);
router.get('/:id',        ctrl.get);
router.put('/:id/ban',    ctrl.ban);
router.put('/:id/unban',  ctrl.unban);
router.delete('/:id',     ctrl.remove);

module.exports = router;
