// src/strategies/payment.strategy.js
const dotenv = require('dotenv');
dotenv.config();

/**
 * ESTRATEGIA CONCRETA: Tarjeta de Crédito
 * Implementa la lógica específica para la API FakePayment
 */
class CreditCardStrategy {
  async execute(amount, details) {
    // 0. Validar API Key
    if (!process.env.FAKE_PAYMENT_API_KEY) {
      console.error("❌ FAKE_PAYMENT_API_KEY no está definida en el .env");
      throw new Error("Configuración del servidor incompleta (Falta API Key de Pagos).");
    }

    // 1. Validamos datos mínimos
    if (!details.cardNumber || !details.cardHolder) {
      throw new Error("Faltan datos de la tarjeta (número o titular) para procesar el pago.");
    }

    // 2. Preparamos el cuerpo de la petición
    // Convertir montos a string para evitar problemas de precisión float
    const body = {
      amount: String(amount),
      currency: "USD",
      "card-number": details.cardNumber.replace(/\s/g, ''), // Limpiar espacios
      "cvv": details.cvv,
      "expiration-month": details.expMonth,
      "expiration-year": details.expYear,
      "full-name": details.cardHolder,
      "description": "Compra en Tienda de Repuestos Joan's Fix",
      "reference": `ref-${Date.now()}`
    };

    console.log("--> Iniciando solicitud a Pasarela de Pago...");
    console.log("    Endpoint: https://fakepayment.onrender.com/payments");

    // Configurar Timeout de 60 segundos (Render hibernate puede tardar)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      // 3. Conexión con la API externa
      const response = await fetch('https://fakepayment.onrender.com/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.FAKE_PAYMENT_API_KEY}`
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      // 4. Manejo de errores de la pasarela
      if (!response.ok || !data.success) {
        console.error("❌ Error API Pagos:", JSON.stringify(data, null, 2));

        let errorMsg = 'Pago rechazado por la pasarela';
        if (data.errors) {
          // Convertir array de errores a texto
          errorMsg = Object.entries(data.errors).map(([k, v]) => `${k}: ${v}`).join(', ');
        } else if (data.message) {
          errorMsg = data.message;
        }
        throw new Error(errorMsg);
      }

      console.log("✅ Pago Aprobado. ID:", data.data.transaction_id);

      // 5. Retorno exitoso estandarizado
      return {
        success: true,
        transactionId: data.data.transaction_id
      };

    } catch (error) {
      clearTimeout(timeoutId);
      console.error("❌ Excepción en Pasarela:", error.message);
      if (error.name === 'AbortError') {
        throw new Error("La pasarela de pago tardó demasiado en responder (Timeout). Intente nuevamente.");
      }
      throw error;
    }
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