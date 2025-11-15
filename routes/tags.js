const express = require('express');
const router = express.Router();
const controller = require('../controllers/tag.controller');
const verifyToken = require('../middleware/auth'); 

router.get('/', verifyToken, controller.getAll);
router.post('/', verifyToken, controller.create);
router.put('/:id', verifyToken, controller.update);
router.delete('/:id', verifyToken, controller.delete);

module.exports = router;