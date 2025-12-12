'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      // 1. Agregar transactionReference a la tabla Orders
      queryInterface.addColumn('Orders', 'transactionReference', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      // 2. Agregar paymentMethod a la tabla Orders (si no lo tenías)
      queryInterface.addColumn('Orders', 'paymentMethod', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      // 3. Agregar unitPrice a la tabla OrderItems
      queryInterface.addColumn('OrderItems', 'unitPrice', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      }),
    ]);
  },

  async down (queryInterface, Sequelize) {
    // Si queremos deshacer el cambio, borramos las columnas
    return Promise.all([
      queryInterface.removeColumn('Orders', 'transactionReference'),
      queryInterface.removeColumn('Orders', 'paymentMethod'),
      queryInterface.removeColumn('OrderItems', 'unitPrice'),
    ]);
  }
};