// src/strategies/payment.strategy.js
const dotenv = require('dotenv');
dotenv.config();

/**
 * ESTRATEGIA CONCRETA: Tarjeta de Crédito
 * Implementa la lógica específica para la API FakePayment
 */
class CreditCardStrategy {
  async execute(amount, details) {
    // 1. Validamos datos mínimos
    if (!details.cardNumber || !details.cardHolder) {
        throw new Error("Faltan datos de la tarjeta (número o titular) para procesar el pago.");
    }

    // 2. Preparamos el cuerpo de la petición (Mapeo de datos)
    const body = {
      amount: amount.toString(),
      currency: "USD",
      "card-number": details.cardNumber,
      "cvv": details.cvv,
      "expiration-month": details.expMonth,
      "expiration-year": details.expYear,
      "full-name": details.cardHolder,
      "description": "Compra en Tienda de Repuestos Joan´s Fix", // Campo OBLIGATORIO para evitar error 400
      "reference": `ref-${Date.now()}`
    };

    console.log("--> Procesando pago con CreditCardStrategy...");

    // 3. Conexión con la API externa
    const response = await fetch('https://fakepayment.onrender.com/payments', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FAKE_PAYMENT_API_KEY}` 
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    // 4. Manejo de errores de la pasarela
    if (!response.ok || !data.success) {
      if(data.errors) console.error("Detalle Error API:", JSON.stringify(data.errors, null, 2));
      throw new Error(data.message || 'Pago rechazado por la pasarela');
    }

    // 5. Retorno exitoso estandarizado
    return {
      success: true,
      transactionId: data.data.transaction_id
    };
  }
}

/**
 * CONTEXTO (PaymentProcessor)
 * Actúa como despachador. Si en el futuro agregas PayPal, solo lo registras aquí.
 */
class PaymentContext {
  constructor() {
    this.strategies = {
      'CreditCard': new CreditCardStrategy()
      // En el futuro puedes agregar: 'PayPal': new PayPalStrategy()
    };
  }

  /**
   * Selecciona y ejecuta la estrategia según el nombre del método.
   */
  async process(methodName, amount, details) {
    const strategy = this.strategies[methodName];
    
    if (!strategy) {
      throw new Error(`El método de pago '${methodName}' no es válido o no está soportado.`);
    }

    return await strategy.execute(amount, details);
  }
}

module.exports = new PaymentContext();