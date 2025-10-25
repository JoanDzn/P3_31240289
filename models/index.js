'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const process = require('process');
const basename = path.basename(__filename); // El nombre de este archivo (index.js)

// Este objeto 'db' guardará todo: la conexión y los modelos
const db = {};

// --- 1. CONFIGURACIÓN DE LA CONEXIÓN ---
// Le decimos a Sequelize que usaremos SQLite y que 
// la base de datos será un archivo llamado 'db.sqlite' 
// en la raíz del proyecto.
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'db.sqlite', // Nombre del archivo de la base de datos
  // Opcional: Descomenta la siguiente línea si no quieres
  // ver los comandos SQL en la consola cada vez que se ejecutan
  // logging: false 
});


// --- 2. CARGA DINÁMICA DE MODELOS ---
// Este código es para "descubrir" automáticamente
// todos los otros archivos .js en esta misma carpeta (models)
// y cargarlos como modelos de Sequelize.
fs
  .readdirSync(__dirname) // Lee todos los archivos del directorio actual
  .filter(file => {
    // Filtra los archivos:
    return (
      file.indexOf('.') !== 0 &&         // Que no empiecen con '.' (ocultos)
      file !== basename &&               // Que no sea este mismo archivo (index.js)
      file.slice(-3) === '.js' &&      // Que terminen en .js
      file.indexOf('.test.js') === -1  // Que no sean archivos de prueba
    );
  })
  .forEach(file => {
    // Por cada archivo de modelo encontrado...
    // lo importamos y lo "inicializamos"
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    // Y lo guardamos en nuestro objeto 'db'
    db[model.name] = model;
  });

// --- 3. EXPORTACIÓN ---
// Adjuntamos la instancia de sequelize (la conexión)
db.sequelize = sequelize;
// Adjuntamos el constructor base de Sequelize
db.Sequelize = Sequelize;

// Exportamos el objeto 'db' para usarlo en el resto de la app
module.exports = db;