const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'db.sqlite'),
    logging: false
});

async function inspect() {
    try {
        const tableNames = await sequelize.getQueryInterface().showAllTables();
        console.log('Tables:', tableNames);

        if (tableNames.includes('Orders_backup')) {
            console.log('Found Orders_backup table. Dropping it...');
            await sequelize.getQueryInterface().dropTable('Orders_backup');
            console.log('Orders_backup dropped.');
        } else {
            console.log('Orders_backup does not exist.');
        }

        if (tableNames.includes('Orders')) {
            const orders = await sequelize.query('SELECT * FROM `Orders`', { type: sequelize.QueryTypes.SELECT });
            console.log('Orders count:', orders.length);
            console.log('Orders sample:', orders.slice(0, 3));

            // Check for null IDs
            const problematic = orders.filter(o => o.id === null || o.id === undefined);
            if (problematic.length > 0) {
                console.log('Found orders with null IDs:', problematic.length);
            }
        }

    } catch (error) {
        console.error('Error inspecting DB:', error);
    }
}

inspect();
