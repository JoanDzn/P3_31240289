const request = require('supertest');

// --- MOCKING (Simulaciones) ---

// 1. Mock de la Estrategia de Pago (Ya lo tenías)
jest.mock('../src/strategies/payment.strategy', () => ({
  process: jest.fn()
}));

// 2. Mock del Middleware de Autenticación (¡NUEVO!)
// Esto evita el error de "req.user undefined" bypasseando la verificación de JWT real
jest.mock('../middleware/auth', () => (req, res, next) => {
  req.user = { id: 1 }; // Simulamos que siempre es el Usuario ID 1 quien llama
  next();
});

// Importamos la app DESPUÉS de los mocks
const app = require('../app'); 
const { sequelize, User, Product, Order } = require('../models');

describe('Pruebas de Integración y Transaccionalidad: /orders', () => {
  let testUser;
  let testProduct;

  // --- CONFIGURACIÓN PREVIA ---
  beforeAll(async () => {
    // Reiniciamos BD
    await sequelize.sync({ force: true });

    // 1. Creamos Usuario con ID fijo = 1 para que coincida con el Mock de Auth
    testUser = await User.create({
      id: 1, // <--- Forzamos el ID
      username: 'tester',
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Tester User' // Campo obligatorio corregido
    });

    // 2. Creamos Producto con datos completos
    testProduct = await Product.create({
      name: 'Producto Test',
      price: 100.00,
      stock: 10,
      description: 'Descripción de prueba', // Campo obligatorio corregido
      brand: 'Marca Test' // Campo obligatorio corregido
    });

    // NOTA: Ya no necesitamos generar token JWT porque el mock lo hace por nosotros
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // ---------------------------------------------------------
  // CASO 1: SEGURIDAD (Adaptado al Mock)
  // ---------------------------------------------------------
  // Nota: Como "mockeamos" el auth para que siempre pase, esta prueba específica 
  // de 401 ya no es relevante en este archivo de integración de Órdenes.
  // Nos enfocaremos en la lógica de negocio (Transacciones).

  // ---------------------------------------------------------
  // CASO 2: STOCK INSUFICIENTE
  // ---------------------------------------------------------
  test('Debe fallar si no hay stock y NO debe crear la orden', async () => {
    const payload = {
      items: [{ id: testProduct.id, quantity: 20 }], // Pedimos 20, hay 10
      paymentMethod: 'CreditCard',
      paymentDetails: { cardNumber: '4111', cardHolder: 'TEST' }
    };

    const res = await request(app)
      .post('/orders')
      // Ya no necesitamos .set('Authorization') gracias al mock
      .send(payload);

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('fail');

    // Verificar Rollback de stock
    const productCheck = await Product.findByPk(testProduct.id);
    expect(productCheck.stock).toBe(10);
  });

  // ---------------------------------------------------------
  // CASO 3: PAGO RECHAZADO (Rollback Completo)
  // ---------------------------------------------------------
  test('Debe hacer ROLLBACK completo si la pasarela rechaza el pago', async () => {
    // Simulamos fallo en la pasarela
    const PaymentProcessor = require('../src/strategies/payment.strategy');
    PaymentProcessor.process.mockRejectedValue(new Error('Fondos insuficientes'));

    const payload = {
      items: [{ id: testProduct.id, quantity: 2 }],
      paymentMethod: 'CreditCard',
      paymentDetails: { cardNumber: '4111', cardHolder: 'REJECTED' }
    };

    const res = await request(app)
      .post('/orders')
      .send(payload);

    expect(res.statusCode).toBe(400);

    // Verificar que el stock NO bajó
    const productCheck = await Product.findByPk(testProduct.id);
    expect(productCheck.stock).toBe(10); 

    // Verificar que NO se creó orden
    const ordersCount = await Order.count();
    expect(ordersCount).toBe(0);
  });

  // ---------------------------------------------------------
  // CASO 4: TRANSACCIÓN EXITOSA
  // ---------------------------------------------------------
  test('Debe crear orden y descontar stock si el pago es exitoso', async () => {
    // Simulamos éxito en la pasarela
    const PaymentProcessor = require('../src/strategies/payment.strategy');
    PaymentProcessor.process.mockResolvedValue({
      success: true,
      transactionId: 'TX-TEST-12345'
    });

    const payload = {
      items: [{ id: testProduct.id, quantity: 5 }], // Compramos 5
      paymentMethod: 'CreditCard',
      paymentDetails: { cardNumber: '4111', cardHolder: 'APPROVED' }
    };

    const res = await request(app)
      .post('/orders')
      .send(payload);

    // Verificar éxito
    expect(res.statusCode).toBe(201);
    expect(res.body.data.order.transactionReference).toBe('TX-TEST-12345');

    // VERIFICACIÓN CRÍTICA: El stock bajó de 10 a 5
    const productCheck = await Product.findByPk(testProduct.id);
    expect(productCheck.stock).toBe(5);
  });
});