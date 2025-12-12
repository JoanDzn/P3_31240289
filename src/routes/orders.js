// src/routes/orders.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/order.controller');

// CORRECCIÓN DE RUTA: 
// Subimos 2 niveles (../../) para salir de 'src' y buscar la carpeta 'middleware' en la raíz
const verifyToken = require('../../middleware/auth'); 

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Gestión de Órdenes y Proceso de Checkout (Transaccional)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: integer
 *           description: ID del producto comprado
 *         quantity:
 *           type: integer
 *           description: Cantidad comprada
 *         unitPrice:
 *           type: number
 *           format: float
 *           description: Precio unitario al momento de la compra
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         totalAmount:
 *           type: number
 *           description: Monto total de la orden
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED, CANCELLED]
 *         paymentMethod:
 *           type: string
 *           description: Método utilizado (CreditCard, PayPal, etc.)
 *         transactionReference:
 *           type: string
 *           description: ID de la transacción devuelto por la pasarela de pago
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *     CheckoutInput:
 *       type: object
 *       required:
 *         - items
 *         - paymentMethod
 *         - paymentDetails
 *       properties:
 *         items:
 *           type: array
 *           description: Lista de productos a comprar
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *         paymentMethod:
 *           type: string
 *           example: "CreditCard"
 *           description: Estrategia de pago a utilizar
 *         paymentDetails:
 *           type: object
 *           description: Datos sensibles para procesar el pago (No se guardan, solo se procesan)
 *           properties:
 *             cardNumber:
 *               type: string
 *             cvv:
 *               type: string
 *             expMonth:
 *               type: string
 *             expYear:
 *               type: string
 *             cardHolder:
 *               type: string
 *               description: Enviar "APPROVED" para éxito o "REJECTED" para probar Rollback
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Crear una nueva orden y procesar el pago
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       **OPERACIÓN TRANSACCIONAL CRÍTICA:** Este endpoint ejecuta una transacción ACID completa.
 *       1. Verifica Stock.
 *       2. Procesa el pago en la API externa.
 *       3. Descuenta el stock y crea la orden.
 *       Si el pago falla o no hay stock, se realiza un **ROLLBACK** total y no se guardan datos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutInput'
 *     responses:
 *       '201':
 *         description: Orden creada y pagada exitosamente
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
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       '400':
 *         description: Error de validación, Stock insuficiente o Pago Rechazado (Rollback ejecutado)
 *       '401':
 *         description: No autorizado (Token faltante o inválido)
 *   get:
 *     summary: Obtener historial de órdenes del usuario
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de items por página
 *     responses:
 *       '200':
 *         description: Lista paginada de órdenes
 *
 * /orders/{id}:
 *   get:
 *     summary: Obtener detalle de una orden específica
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la orden
 *     responses:
 *       '200':
 *         description: Detalle completo de la orden con sus items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       '404':
 *         description: Orden no encontrada o no pertenece al usuario
 */

router.use(verifyToken);

router.post('/', controller.create);       // Crear Orden (Transaccional)
router.get('/', controller.getAll);        // Historial
router.get('/:id', controller.getOne);     // Detalle

module.exports = router;