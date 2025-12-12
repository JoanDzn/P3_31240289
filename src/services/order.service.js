// src/services/order.service.js

// Ajuste de ruta: '..' sale de 'services' y entra a 'models'
const path = require('path');
const { sequelize, Product, Order, OrderItem } = require(path.join(__dirname, '../../models'));
const PaymentProcessor = require('../strategies/payment.strategy');

class OrderService {
  
  async createOrder(userId, items, paymentDetails) {
    // 1. INICIAR TRANSACCIÓN (ATOMICIDAD)
    const t = await sequelize.transaction();

    try {
      let totalAmount = 0;
      const orderItemsData = [];

      // 2. VERIFICACIÓN DE STOCK Y CÁLCULO DE TOTAL
      for (const item of items) {
        // Buscamos el producto con bloqueo de lectura (opcional pero recomendado)
        const product = await Product.findByPk(item.id, { transaction: t });

        if (!product) {
          throw new Error(`Producto con ID ${item.id} no encontrado.`);
        }

        // Verificamos Stock
        if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}`);
        }

        // Calculamos precio
        const itemTotal = parseFloat(product.price) * item.quantity;
        totalAmount += itemTotal;

        // Preparamos datos para OrderItem
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price // Precio histórico
        });
      }

// 3. INTEGRACIÓN DE PAGO (Patrón Strategy Dinámico)
      
      // A. Identificamos qué método quiere usar el usuario (ej. "CreditCard", "Bitcoin")
      // Si no envía nada, asumimos 'CreditCard' por defecto (opcional)
      const methodToUse = paymentDetails.method; 

      if (!methodToUse) {
         throw new Error("Debe especificar un 'paymentMethod' (ej. CreditCard).");
      }

      console.log(`Intentando pagar con: ${methodToUse}`);

      // B. Delegamos al Contexto la ejecución
      // Esto lanzará error si methodToUse es "Bitcoin" porque no existe en el mapa
      const paymentResult = await PaymentProcessor.process(methodToUse, totalAmount, paymentDetails);

      // 4. ACTUALIZACIÓN DE STOCK Y CREACIÓN DE REGISTROS
      
      // A. Descontar Stock
      for (const item of items) {
        await Product.decrement('stock', { 
          by: item.quantity, 
          where: { id: item.id },
          transaction: t 
        });
      }

      // B. Crear la Orden
      const newOrder = await Order.create({
        userId: userId,
        totalAmount: totalAmount,
        status: 'COMPLETED',
        paymentMethod: paymentDetails.method || 'CreditCard',
        // Guardamos la referencia de la pasarela (importante para auditoría)
        transactionReference: paymentResult.transactionId 
      }, { transaction: t });

      // C. Crear los Detalles (Items)
      const itemsWithOrderId = orderItemsData.map(item => ({
        ...item,
        orderId: newOrder.id
      }));
      
      await OrderItem.bulkCreate(itemsWithOrderId, { transaction: t });

      // 5. CONFIRMAR TRANSACCIÓN (COMMIT)
      await t.commit();

      // Devolvemos la orden con sus items
      return await Order.findByPk(newOrder.id, {
        include: ['items'] 
      });

    } catch (error) {
      // 6. REVERTIR TODO (ROLLBACK)
      if (t) await t.rollback();
      // Relanzar error para el controlador
      throw error; 
    }
  }

  // Obtener historial del usuario
  async getUserOrders(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return await Order.findAndCountAll({
      where: { userId },
      include: [
        { 
          model: OrderItem, 
          as: 'items',
          include: ['product'] // Asegúrate que tu modelo OrderItem tenga la relación 'product'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
  }

  // Detalle de orden
  async getOrderDetail(orderId, userId) {
    const order = await Order.findOne({
      where: { id: orderId, userId },
      include: [
        { 
          model: OrderItem, 
          as: 'items',
          include: ['product'] 
        }
      ]
    });
    return order;
  }
}

module.exports = new OrderService();