const { User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

async function diagnose() {
    try {
        console.log("--- DIAGNOSTICANDO AUTENTICACIÓN ---");
        const email = 'joan2006vg22@gmail.com';
        const rawPass = '31240289'; // La contraseña del seed

        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log("❌ Usuario NO encontrado en la BD.");
            return;
        }

        console.log(`✅ Usuario encontrado: ID ${user.id}, Email: ${user.email}`);
        console.log(`🔐 Hash en BD: ${user.password}`);

        // Verificar si es un hash de bcrypt válido (empieza por $2a$ o $2b$)
        if (!user.password.startsWith('$2')) {
            console.log("⚠️ EL PRODUCTO DE LA SIEMBRA NO TIENE UN HASH VÁLIDO (Posible texto plano).");
            console.log("🛠️ Intentando corregir automáticamente...");

            // Corregir
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(rawPass, salt);
            user.password = hash;
            await user.save();
            console.log("✅ Contraseña actualizada correctamente a un Hash seguro.");
        } else {
            console.log("ℹ️ El formato del hash parece correcto.");

            // Probar comparación
            const isMatch = await bcrypt.compare(rawPass, user.password);
            console.log(`🧪 Prueba de comparación con '${rawPass}': ${isMatch ? 'ÉXITO (match)' : 'FALLO (no match)'}`);
        }

    } catch (error) {
        console.error("❌ Error fatal en diagnóstico:", error);
    } finally {
        await sequelize.close();
    }
}

diagnose();
