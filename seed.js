'use strict';

// Importamos los modelos para poder interactuar con la DB
const db = require('./models');
const { User } = db; // Obtenemos el modelo User

/**
 * Función principal para poblar la base de datos.
 */
async function seedDatabase() {
  console.log('Iniciando script de siembra (seeding)...');
  
  try {
    // Sincroniza la base de datos (asegura que las tablas existan)
    await db.sequelize.sync();

    console.log('Buscando o creando tu usuario...');

    // ----- TU USUARIO -----
    // findOrCreate: Busca un usuario con tu email.
    // Si no lo encuentra, lo crea usando los 'defaults'.
    const [user, created] = await User.findOrCreate({
      where: { email: 'joan2006vg22@gmail.com' }, // <-- Tu Email
      defaults: {
        fullName: 'Joan Jose Garcia Valenzuela', // <-- Tu Nombre
        password: '31240289' // <-- Tu Contraseña (texto plano por ahora)
      }
    });

    if (created) {
      console.log('✅ Usuario creado:', user.toJSON());
    } else {
      console.log('✅ Tu usuario ya existía en la base de datos.');
    }

    console.log('Siembra de datos completada.');

  } catch (error) {
    // Manejo de errores
    console.Error('❌ Error durante la siembra de datos:', error);
  } finally {
    // IMPORTANTE: Cierra la conexión a la base de datos
    console.log('Cerrando conexión a la base de datos...');
    await db.sequelize.close();
  }
}

// Ejecutamos la función
seedDatabase();