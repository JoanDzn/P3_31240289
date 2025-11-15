const { Category } = require('../models');

module.exports = {
  // Obtener todas
  async getAll(req, res) {
    try {
      const categories = await Category.findAll();
      return res.status(200).json({ status: 'success', data: { categories } });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // Crear
  async create(req, res) {
    try {
      const { name, description } = req.body;
      const category = await Category.create({ name, description });
      return res.status(201).json({ status: 'success', data: { category } });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ status: 'fail', data: { name: 'La categoría ya existe' } });
      }
      return res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // Actualizar
  async update(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await Category.update(req.body, { where: { id } });
      if (!updated) return res.status(404).json({ status: 'fail', data: { message: 'Categoría no encontrada' } });
      const category = await Category.findByPk(id);
      return res.status(200).json({ status: 'success', data: { category } });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // Eliminar
  async delete(req, res) {
    try {
      const deleted = await Category.destroy({ where: { id: req.params.id } });
      if (!deleted) return res.status(404).json({ status: 'fail', data: { message: 'Categoría no encontrada' } });
      return res.status(200).json({ status: 'success', data: null });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }
};