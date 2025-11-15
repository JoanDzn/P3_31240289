const { DataTypes } = require('sequelize');
const slugify = require('slugify'); // La librería que instalamos

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // --- Datos Básicos ---
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 }
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 }
    },
    sku: { // Código de barra o inventario
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    slug: { // URL amigable (se genera sola)
      type: DataTypes.STRING,
      unique: true,
    },
    
    // --- Datos Específicos de Repuestos de Moto ---
    brand: { // Marca del fabricante del repuesto (Ej: Empire, Osaka)
      type: DataTypes.STRING,
      allowNull: false
    },
    compatibility: { // ¿A qué moto le sirve? (Ej: "Horse, Owen, Universal")
      type: DataTypes.STRING,
      allowNull: true
    },
    material: { // (Ej: "Acero", "Plástico")
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true,
    hooks: {
      // Esto se ejecuta antes de guardar para crear el SLUG
      beforeValidate: (product) => {
        if (product.name) {
            product.slug = slugify(product.name, { lower: true, strict: true });
        }
      },
      beforeUpdate: (product) => {
        if (product.changed('name')) {
            product.slug = slugify(product.name, { lower: true, strict: true });
        }
      }
    }
  });

  return Product;
};