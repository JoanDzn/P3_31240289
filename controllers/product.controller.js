const { Product, Category, Tag, sequelize } = require('../models');

module.exports = {
  // --- ADMINISTRACIÓN (Protegido) ---

  // 1. Crear Producto (POST)
  async create(req, res) {
    const t = await sequelize.transaction();
    try {
      // Extraemos los datos del body, incluyendo categoryId, tags y imageUrl
      // Ej: tags: [1, 2]
      let { name, description, price, stock, sku, brand, compatibility, material, categoryId, tags, imageUrl } = req.body;

      // Sanitize SKU
      if (sku === '') sku = null;

      // Lista de imágenes disponibles en el servidor
      const availableImages = [
        'images1.jpg', 'images2.png', 'images3.webp', 'images4.png',
        'images5.jpg', 'images6.jpg', 'images7.jpg', 'images8.png',
        'images9.jpg', 'images10.webp', 'images11.png', 'images12.png',
        'images13.png'
      ];

      // Si no se envía imagen, asignar una aleatoria
      if (!imageUrl) {
        const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
        imageUrl = `/img/products/${randomImage}`;
      }

      // Validar categoryId si se envía
      if (categoryId) {
        const categoryExists = await Category.findByPk(categoryId);
        if (!categoryExists) {
          await t.rollback();
          return res.status(400).json({ status: 'fail', data: { message: 'Categoría no encontrada (categoryId inválido)' } });
        }
      }

      // Validar tags
      if (tags && tags.length > 0) {
        if (!Array.isArray(tags)) {
          await t.rollback();
          return res.status(400).json({ status: 'fail', data: { message: 'El campo tags debe ser un arreglo de IDs' } });
        }
        const foundTags = await Tag.findAll({ where: { id: tags } });
        const foundIds = foundTags.map(t => t.id);
        const missing = tags.filter(id => !foundIds.includes(id));
        if (missing.length > 0) {
          await t.rollback();
          return res.status(400).json({ status: 'fail', data: { message: 'Algunos tags no existen', missing } });
        }
      }

      // VERIFICACIÓN EXPLÍCITA DE DUPLICADOS (Para mejorar mensaje de error)
      const existingProduct = await Product.findOne({ where: { name } });
      if (existingProduct) {
        await t.rollback();
        return res.status(400).json({ status: 'fail', data: { message: `Ya existe un producto con el nombre '${name}'.` } });
      }

      if (sku) {
        const existingSku = await Product.findOne({ where: { sku } });
        if (existingSku) {
          await t.rollback();
          return res.status(400).json({ status: 'fail', data: { message: `Ya existe un producto con el SKU '${sku}'.` } });
        }
      }

      // 1. Creamos el producto
      const newProduct = await Product.create({
        name, description, price, stock, sku, brand, compatibility, material, categoryId, imageUrl
      }, { transaction: t });

      // 2. Si vienen tags, hacemos la relación
      if (tags && tags.length > 0) {
        await newProduct.setTags(tags, { transaction: t });
      }

      await t.commit();

      const productWithRelations = await Product.findByPk(newProduct.id, {
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name'] },
          { model: Tag, as: 'tags', attributes: ['id', 'name'], through: { attributes: [] } }
        ]
      });

      return res.status(201).json({ status: 'success', data: { product: productWithRelations } });
    } catch (error) {
      // Si la transacción no ha terminado, rollback
      try { await t.rollback(); } catch (e) { }

      console.error("Error creating product:", error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ status: 'fail', data: { message: 'El nombre o SKU ya existe (Constraint Error).' } });
      }
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ status: 'fail', data: { message: 'Error de clave foránea.', detail: error.message } });
      }
      return res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // 2. Actualizar Producto (PUT)
  async update(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { tags, sku, ...dataToUpdate } = req.body;

      if (sku === '') dataToUpdate.sku = null;
      else if (sku !== undefined) dataToUpdate.sku = sku;

      // Verificamos si existe
      const product = await Product.findByPk(id);
      if (!product) {
        await t.rollback();
        return res.status(404).json({ status: 'fail', data: { message: 'Producto no encontrado' } });
      }

      // Actualizamos datos básicos (incluyendo imageUrl si viene)
      await product.update(dataToUpdate, { transaction: t });

      // Si enviaron tags nuevos, actualizamos la relación (reemplaza los anteriores)
      if (tags) {
        await product.setTags(tags, { transaction: t });
      }

      await t.commit();

      // Refetch
      const updatedProduct = await Product.findByPk(id);

      return res.status(200).json({ status: 'success', data: { product: updatedProduct } });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // 3. Eliminar Producto (DELETE)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({ status: 'fail', data: { message: 'Producto no encontrado' } });
      }

      await product.destroy();
      return res.status(200).json({ status: 'success', data: null });
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ status: 'fail', data: { message: 'No se puede eliminar el producto porque tiene relaciones activas (órdenes, etc).' } });
      }
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