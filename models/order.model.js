module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    // ID se genera automático (integer o uuid según tu config general)
    
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'COMPLETED', 'CANCELLED'),
      defaultValue: 'PENDING'
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // CAMPO IMPORTANTE: Aquí guardamos el ID que nos devuelve la API de pagos
    transactionReference: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Orders' // Opcional, pero buena práctica
  });

  Order.associate = function(models) {
    // Relación 1: Una orden pertenece a un Usuario
    // Asegúrate de que tu modelo de usuario se llame 'User' (ver archivo user.js)
    Order.belongsTo(models.User, { 
      foreignKey: 'userId', 
      as: 'user' 
    });

    // Relación 2: Una orden tiene muchos Items
    // IMPORTANTE: el 'as: items' es vital para que funcione el include: ['items'] del servicio
    Order.hasMany(models.OrderItem, { 
      foreignKey: 'orderId', 
      as: 'items' 
    });
  };

  return Order;
};