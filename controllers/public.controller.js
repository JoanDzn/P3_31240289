const ProductRepository = require('../repositories/product.repository');
const ProductQueryBuilder = require('../builders/product.builder');
const { Tag } = require('../models'); // Necesitamos el modelo Tag para pasarlo al builder

module.exports = {
  // --- 1. Detalle (Refactorizado con Repository) ---
  async getProductDetail(req, res) {
    try {
      const { id, slug } = req.params;

      // Usamos el Repository
      const product = await ProductRepository.findById(id);

      if (!product) {
        return res.status(404).json({ status: 'fail', data: { message: 'Producto no encontrado' } });
      }

      if (slug !== product.slug) {
        const correctUrl = `/p/${product.id}-${product.slug}`;
        return res.redirect(301, correctUrl); 
      }

      return res.status(200).json({ status: 'success', data: { product } });
    } catch (error) {
      console.error('Error listProducts:', error);
      return res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // --- 2. Listado (Refactorizado con Builder y Repository) ---
  async listProducts(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      // 1. Instanciamos el Builder y encadenamos los filtros
      const queryOptions = new ProductQueryBuilder(req.query)
        .filterBySearch()
        .filterByPrice()
        .filterByCategory()
        .filterByAttributes() // Marca, Compatibilidad, etc.
        .filterByTags(Tag)    // Pasamos el modelo Tag necesario para la relación
        .build();             // Obtenemos el objeto final { where, include, order }

      // 2. Llamamos al Repository con las opciones construidas
      const { count, rows } = await ProductRepository.findAndCount(queryOptions, page, limit);

      return res.status(200).json({
        status: 'success',
        data: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          products: rows
        }
      });

    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }
};