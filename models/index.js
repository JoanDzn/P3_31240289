'use strict';

const { Sequelize, DataTypes } = require('sequelize');

// 1. Configuración de conexión
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'db.sqlite',
  logging: false
});

// 2. Importación de Modelos
const User = require('./user')(sequelize, DataTypes);
const Category = require('./category.model')(sequelize, DataTypes);
const Tag = require('./tag.model')(sequelize, DataTypes);
const Product = require('./product.model')(sequelize, DataTypes);
// --- NUEVOS MODELOS ---
const Order = require('./order.model')(sequelize, DataTypes);
const OrderItem = require('./order-item.model')(sequelize, DataTypes);

// 3. Definición de Relaciones

// A. Categorías y Productos
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// B. Productos y Tags
Product.belongsToMany(Tag, { through: 'ProductTags', as: 'tags' });
Tag.belongsToMany(Product, { through: 'ProductTags', as: 'products' });

// --- NUEVAS RELACIONES (SISTEMA DE ÓRDENES) ---

// C. Usuarios y Órdenes (Un usuario tiene muchas órdenes)
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// D. Órdenes y Items (Una orden tiene muchos items)
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// E. Productos y Items (Un item pertenece a un producto)
// Esto es vital para descontar stock después
Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// 4. Exportar
module.exports = {
  sequelize,
  Sequelize,
  User,
  Category,
  Tag,
  Product,
  Order,
  OrderItem
};