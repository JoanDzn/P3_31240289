const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


router.post(
  '/register',
  [
    // --- Validación de Entrada ---
    body('fullName')
      .trim()
      .notEmpty()
      .withMessage('El nombre completo es obligatorio.'),

    body('email')
      .trim()
      .isEmail()
      .withMessage('Debe proporcionar un email válido.')
      .custom(async (value) => {
        const user = await User.findOne({ where: { email: value } });
        if (user) {
          return Promise.reject('El correo electrónico ya está en uso.');
        }
      }),

    body('password')
      .trim()
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres.')
  ],
  async (req, res) => {
    // --- Manejo de Errores de Validación ---
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        data: errors.array()
      });
    }

    // --- Creación del Usuario ---
    try {
      const { fullName, email, password } = req.body;

      const newUser = await User.create({
        fullName,
        email,
        password
      });

      // --- Respuesta Exitosa (JSend) ---
      res.status(201).json({
        status: 'success',
        data: {
          user: newUser
        }
      });
    } catch (error) {
      // --- Respuesta de Error del Servidor (JSend) ---
      console.error(error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor al crear el usuario.'
      });
    }
  }
);


router.post(
  '/login',
  [
    // 1. Validación de entrada (simple)
    body('email', 'Por favor, incluya un email válido').trim().isEmail(),
    body('password', 'La contraseña es obligatoria').trim().notEmpty()
  ],
  async (req, res) => {
    // --- Manejo de Errores de Validación ---
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        data: errors.array()
      });
    }

    const { email, password } = req.body;

    try {
      // --- 2. Verificar si el usuario existe ---
      const user = await User.findOne({ where: { email } });

      if (!user) {
        // Damos un mensaje genérico por seguridad
        return res.status(400).json({
          status: 'fail',
          data: { message: 'Credenciales inválidas' }
        });
      }

      // --- 3. Comparar la contraseña ---
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          status: 'fail',
          data: { message: 'Credenciales inválidas' }
        });
      }

      // --- 4. Crear y Firmar el JWT ---
      const payload = {
        user: {
          id: user.id // Guardamos solo el ID del usuario
        }
      };

      // Firmamos el token usando nuestra clave secreta
      jwt.sign(
        payload,
        process.env.JWT_SECRET, // <-- Tu clave secreta del .env
        { expiresIn: '1h' }, // El token expira en 1 hora
        (err, token) => {
          if (err) throw err;

          // --- 5. Respuesta Exitosa (JSend) ---
          res.status(200).json({
            status: 'success',
            data: {
              token // Devolvemos el token al cliente
            }
          });
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor.'
      });
    }
  }
);

module.exports = router;