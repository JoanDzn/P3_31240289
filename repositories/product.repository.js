const { Product, Category, Tag } = require('../models');

class ProductRepository {
  
  // Buscar un producto por ID con sus relaciones
  async findById(id) {
    return await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name'], through: { attributes: [] } }
      ]
    });
  } 

  // Búsqueda avanzada con paginación
  // Recibe las condiciones ya construidas por el Builder
  async findAndCount(options, page, limit) {
    const offset = (page - 1) * limit;

    // Siempre incluimos la categoría para mostrarla en la lista
    // Si el builder ya agregó 'include' (por los tags), lo combinamos
    const includes = [
      ...options.include,
      { model: Category, as: 'category', attributes: ['name'] }
    ];

    // Eliminamos duplicados por su alias 'as' o por el nombre del modelo
    const uniqueInclude = [];
    const seen = new Set();
    for (const inc of includes) {
      const key = inc.as || (inc.model && inc.model.name) || JSON.stringify(inc);
      if (!seen.has(key)) {
        seen.add(key);
        uniqueInclude.push(inc);
      }
    }

    return await Product.findAndCountAll({
      where: options.where,
      include: uniqueInclude,
      order: options.order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true // Importante para contar bien con includes
    });
  }
}

module.exports = new ProductRepository();