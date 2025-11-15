const express = require('express');
const router = express.Router();
const controller = require('../controllers/public.controller');

/**
 * @openapi
 * /products:
 *   get:
 *     tags:
 *       - "Público - Productos"
 *     summary: "Búsqueda Avanzada de Productos"
 *     description: "Filtra, busca y pagina productos. No requiere token."
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: "Busca por nombre o descripción"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: price_min
 *         schema:
 *           type: number
 *       - in: query
 *         name: price_max
 *         schema:
 *           type: number
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: "Lista de IDs separados por coma (ej. 1,2)"
 *     responses:
 *       '200':
 *         description: "Resultados de la búsqueda"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *
 * /p/{id}-{slug}:
 *   get:
 *     tags:
 *       - "Público - Productos"
 *     summary: "Detalle de Producto (Self-Healing)"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: "Detalle del producto"
 *       '301':
 *         description: "Redirección si el slug es incorrecto"
 */

// 1. Búsqueda (Esta ruta sumada al '/' del app.js crea '/products')
router.get('/products', controller.listProducts);

// 2. Detalle (Esta ruta sumada al '/' del app.js crea '/p/:id-:slug')
router.get('/p/:id-:slug', controller.getProductDetail);

module.exports = router;