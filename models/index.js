'use strict';

const { Sequelize, DataTypes } = require('sequelize');

// --- 1. CONFIGURACIÓN DE LA CONEXIÓN ---
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'db.sqlite',
  logging: false 
});

// --- 2. IMPORTACIÓN MANUAL DE MODELOS ---
// Importamos cada archivo explícitamente para evitar errores de nombres
const User = require('./user')(sequelize, DataTypes);
const Category = require('./category.model')(sequelize, DataTypes);
const Tag = require('./tag.model')(sequelize, DataTypes);
const Product = require('./product.model')(sequelize, DataTypes);

// --- 3. DEFINICIÓN DE RELACIONES (ASOCIACIONES) ---
// Esta es la parte que faltaba y que soluciona el error "setTags is not a function"

// Relación: Una Categoría tiene muchos Productos
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Relación: Productos y Tags (Muchos a Muchos)
// Al definir esto, Sequelize crea automáticamente los métodos .setTags(), .addTags(), etc.
Product.belongsToMany(Tag, { through: 'ProductTags', as: 'tags' });
Tag.belongsToMany(Product, { through: 'ProductTags', as: 'products' });

// --- 4. EXPORTACIÓN ---
module.exports = {
  sequelize,
  Sequelize,
  User,
  Category,
  Tag,
  Product
};