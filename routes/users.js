const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { body, validationResult } = require('express-validator');

// --- Importamos nuestro middleware "guardián" ---
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    // Busca todos los usuarios.
    const users = await User.findAll();

    res.json({
      status: 'success',
      data: {
        users
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'error', message: 'Error del Servidor' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        data: { message: 'Usuario no encontrado' }
      });
    }

    res.json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'error', message: 'Error del Servidor' });
  }
});


router.post(
  '/',
  [
    auth, // <--- El middleware de auth
    // Validaciones (iguales a las de registro)
    body('fullName', 'El nombre completo es obligatorio').notEmpty(),
    body('email', 'Por favor, incluya un email válido').isEmail(),
    body('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
    body('email').custom(async (value) => {
      const user = await User.findOne({ where: { email: value } });
      if (user) {
        return Promise.reject('El correo electrónico ya está en uso.');
      }
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'fail', data: errors.array() });
    }

    try {
      const { fullName, email, password } = req.body;

      // Creamos el usuario (el hook hashea la pass)
      const newUser = await User.create({
        fullName,
        email,
        password
      });

      res.status(201).json({
        status: 'success',
        data: {
          user: newUser
        }
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ status: 'error', message: 'Error del Servidor' });
    }
  }
);

router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        data: { message: 'Usuario no encontrado' }
      });
    }

    // Actualizamos solo los campos permitidos
    const { fullName, email } = req.body;
    await user.update({
      fullName: fullName || user.fullName,
      email: email || user.email
      // Nota: No permitimos actualizar la contraseña aquí
    });

    res.json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'error', message: 'Error del Servidor' });
  }
});


router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        data: { message: 'Usuario no encontrado' }
      });
    }

    await user.destroy();

    res.json({
      status: 'success',
      data: null // Opcional: { message: 'Usuario eliminado' }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'error', message: 'Error del Servidor' });
  }
});

module.exports = router;