const { Product, Category, Tag } = require('../models');

module.exports = {
  // --- ADMINISTRACIÓN (Protegido) ---

  // 1. Crear Producto (POST)
  async create(req, res) {
    try {
      // Extraemos los datos del body, incluyendo categoryId y el array de tags
      // Ej: tags: [1, 2]
      const { name, description, price, stock, sku, brand, compatibility, material, categoryId, tags } = req.body;

      // 1. Creamos el producto
      const newProduct = await Product.create({
        name, description, price, stock, sku, brand, compatibility, material, categoryId
      });

      // 2. Si vienen tags, hacemos la relación mágica
      if (tags && tags.length > 0) {
        await newProduct.setTags(tags); // Sequelize vincula los IDs automáticamente
      }

      // 3. Buscamos el producto de nuevo para devolverlo con sus relaciones
      const productWithRelations = await Product.findByPk(newProduct.id, {
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name'] },
          { model: Tag, as: 'tags', attributes: ['id', 'name'], through: { attributes: [] } }
        ]
      });

      return res.status(201).json({ status: 'success', data: { product: productWithRelations } });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ status: 'fail', data: { message: 'El nombre o SKU ya existe.' } });
        }
        return res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // 2. Actualizar Producto (PUT)
  async update(req, res) {
    try {
      const { id } = req.params;
      const { tags, ...dataToUpdate } = req.body;

      // Verificamos si existe
      const product = await Product.findByPk(id);
      if (!product) return res.status(404).json({ status: 'fail', data: { message: 'Producto no encontrado' } });

      // Actualizamos datos básicos
      await product.update(dataToUpdate);

      // Si enviaron tags nuevos, actualizamos la relación (reemplaza los anteriores)
      if (tags) {
        await product.setTags(tags);
      }

      return res.status(200).json({ status: 'success', data: { product } });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // 3. Eliminar Producto (DELETE)
  async delete(req, res) {
    try {
      const deleted = await Product.destroy({ where: { id: req.params.id } });
      if (!deleted) return res.status(404).json({ status: 'fail', data: { message: 'Producto no encontrado' } });
      return res.status(200).json({ status: 'success', data: null });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // 4. Obtener un producto por ID (Para admin o vista detalle)
  async getOne(req, res) {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                { model: Category, as: 'category' },
                { model: Tag, as: 'tags', through: { attributes: [] } }
            ]
        });
        if (!product) return res.status(404).json({ status: 'fail', data: { message: 'Producto no encontrado' } });
        return res.status(200).json({ status: 'success', data: { product } });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
  }
};