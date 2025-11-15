const express = require('express');
const router = express.Router();
const controller = require('../controllers/product.controller');
const verifyToken = require('../middleware/auth'); 

/**
 * @openapi
 * /products:
 *   post:
 *     tags: [Admin - Productos]
 *     summary: Crear Producto
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Producto creado
 *
 * /products/{id}:
 *   put:
 *     tags: [Admin - Productos]
 *     summary: Actualizar Producto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Actualizado
 *   delete:
 *     tags: [Admin - Productos]
 *     summary: Eliminar Producto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Eliminado
 *   get:
 *     tags: [Admin - Productos]
 *     summary: Ver detalle (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto encontrado
 */

// --- Rutas de GESTIÓN (Requieren Token) ---
router.post('/', verifyToken, controller.create);      // Crear
router.put('/:id', verifyToken, controller.update);    // Editar
router.delete('/:id', verifyToken, controller.delete); // Eliminar
router.get('/:id', verifyToken, controller.getOne);    // Ver detalle (Admin)

module.exports = router;