const express = require('express');
const router = express.Router();
const controller = require('../controllers/tag.controller');
const verifyToken = require('../middleware/auth'); 

/**
 * @openapi
 * /tags:
 *   get:
 *     tags: [Tags]
 *     summary: Obtener todos los tags
 *     description: Devuelve la lista completa de tags (ruta protegida).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de tags
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     tags:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Tag'
 *       '401':
 *         description: No autorizado
 *   post:
 *     tags: [Tags]
 *     summary: Crear un nuevo tag
 *     description: Crea un tag nuevo. Requiere token.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Original
 *     responses:
 *       '201':
 *         description: Tag creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     tag:
 *                       $ref: '#/components/schemas/Tag'
 *       '400':
 *         description: Error de validación (ej. nombre duplicado)
 *       '401':
 *         description: No autorizado
 *
 * /tags/{id}:
 *   put:
 *     tags: [Tags]
 *     summary: Actualizar un tag
 *     description: Actualiza el nombre de un tag existente. Requiere token.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Oferta
 *     responses:
 *       '200':
 *         description: Tag actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     tag:
 *                       $ref: '#/components/schemas/Tag'
 *       '400':
 *         description: Request inválido
 *       '401':
 *         description: No autorizado
 *       '404':
 *         description: Tag no encontrado
 *   delete:
 *     tags: [Tags]
 *     summary: Eliminar un tag
 *     description: Elimina un tag por ID. Requiere token.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Tag eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   nullable: true
 *                   example: null
 *       '401':
 *         description: No autorizado
 *       '404':
 *         description: Tag no encontrado
 */

router.get('/', verifyToken, controller.getAll);
router.post('/', verifyToken, controller.create);
router.put('/:id', verifyToken, controller.update);
router.delete('/:id', verifyToken, controller.delete);

module.exports = router;