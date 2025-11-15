const { Tag } = require('../models');

module.exports = {
  async getAll(req, res) {
    try {
      const tags = await Tag.findAll();
      return res.status(200).json({ status: 'success', data: { tags } });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  },

  async create(req, res) {
    try {
      const { name } = req.body;
      const tag = await Tag.create({ name });
      return res.status(201).json({ status: 'success', data: { tag } });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ status: 'fail', data: { name: 'El tag ya existe' } });
      }
      return res.status(500).json({ status: 'error', message: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await Tag.update(req.body, { where: { id } });
      if (!updated) return res.status(404).json({ status: 'fail', data: { message: 'Tag no encontrado' } });
      const tag = await Tag.findByPk(id);
      return res.status(200).json({ status: 'success', data: { tag } });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  },

  async delete(req, res) {
    try {
      const deleted = await Tag.destroy({ where: { id: req.params.id } });
      if (!deleted) return res.status(404).json({ status: 'fail', data: { message: 'Tag no encontrado' } });
      return res.status(200).json({ status: 'success', data: null });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }
};