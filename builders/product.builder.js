const { Op } = require('sequelize');

class ProductQueryBuilder {
  constructor(query) {
    this.query = query; // Los parámetros de la URL (req.query)
    this.where = {};    // Aquí acumularemos los filtros del producto
    this.include = [];  // Aquí acumularemos las relaciones (Category, Tag)
    this.order = [['createdAt', 'DESC']]; // Orden por defecto
  }

  // 1. Filtro de búsqueda (nombre o descripción)
  filterBySearch() {
    if (this.query.search) {
      this.where[Op.or] = [
        { name: { [Op.like]: `%${this.query.search}%` } },
        { description: { [Op.like]: `%${this.query.search}%` } }
      ];
    }
    return this; // Retornamos 'this' para encadenar métodos
  }

  // 2. Filtro de Precio
  filterByPrice() {
    if (this.query.price_min) {
      this.where.price = { ...this.where.price, [Op.gte]: this.query.price_min };
    }
    if (this.query.price_max) {
      this.where.price = { ...this.where.price, [Op.lte]: this.query.price_max };
    }
    return this;
  }

  // 3. Filtro de Categoría
  filterByCategory() {
    if (this.query.category) {
      this.where.categoryId = this.query.category;
    }
    return this;
  }

  // 4. Filtros Personalizados (Motos)
  filterByAttributes() {
    if (this.query.brand) this.where.brand = this.query.brand;
    if (this.query.material) this.where.material = this.query.material;
    if (this.query.compatibility) {
      this.where.compatibility = { [Op.like]: `%${this.query.compatibility}%` };
    }
    return this;
  }

  // 5. Filtro Complejo de Tags
  filterByTags(TagModel) {
    if (this.query.tags) {
      const tagList = this.query.tags.split(',').map(id => parseInt(id));
      this.include.push({
        model: TagModel,
        as: 'tags',
        attributes: [],
        where: { id: { [Op.in]: tagList } },
        through: { attributes: [] }
      });
    }
    return this;
  }

  // Método final para obtener el resultado construido
  build() {
    return {
      where: this.where,
      include: this.include,
      order: this.order
    };
  }
}

module.exports = ProductQueryBuilder;