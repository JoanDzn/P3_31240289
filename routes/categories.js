const express = require('express');
const router = express.Router();
const controller = require('../controllers/category.controller');
// Ajusta esta ruta si tu middleware tiene otro nombre
const verifyToken = require('../middleware/auth'); 

/**
 * @openapi
 * /categories:
 *   get:
 *     tags:
 *       - Categorías
 *     summary: Listar categorías
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista obtenida
 *   post:
 *     tags:
 *       - Categorías
 *     summary: Crear categoría
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Creado
 */

router.get('/', verifyToken, controller.getAll);
router.post('/', verifyToken, controller.create);
router.put('/:id', verifyToken, controller.update);
router.delete('/:id', verifyToken, controller.delete);

module.exports = router;