const { sequelize, Product, Category, Tag } = require('../models');
const ProductQueryBuilder = require('../builders/product.builder');
const ProductRepository = require('../repositories/product.repository');

(async ()=>{
  try {
    await sequelize.sync({ force: true });
    // create category, tag, product
    const cat = await Category.create({ name: 'Frenos', description: 'Sistemas de frenado' });
    const tag = await Tag.create({ name: 'Original' });
    const prod = await Product.create({
      name: 'Pastilla Bera SBR',
      description: 'Pastilla cerámica',
      price: 10.5,
      stock: 20,
      brand: 'Bera Genuine',
      categoryId: cat.id,
      compatibility: 'SBR'
    });
    await prod.setTags([tag.id]);

    const query = { search: 'Cerámica' };
    const qb = new ProductQueryBuilder(query).filterBySearch().build();
    console.log('QueryOptions:', qb);
    const res = await ProductRepository.findAndCount(qb, 1, 10);
    console.log('findAndCount result:', res);
  } catch (err) {
    console.error('DEBUG ERROR:', err);
  } finally {
    await sequelize.close();
  }
})();
