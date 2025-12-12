module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Precio del producto al momento de la compra (histórico)'
    }
  }, {
    tableName: 'OrderItems'
  });

  OrderItem.associate = function(models) {
    // Relación 1: El item pertenece a una Orden
    OrderItem.belongsTo(models.Order, { 
      foreignKey: 'orderId', 
      as: 'order' 
    });

    // Relación 2: El item refiere a un Producto
    // IMPORTANTE: el 'as: product' es vital para el include: ['product'] en el historial
    OrderItem.belongsTo(models.Product, { 
      foreignKey: 'productId', 
      as: 'product' 
    });
  };

  return OrderItem;
};