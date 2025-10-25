// Archivo: middleware/auth.js

const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Obtener el token del encabezado (header)
  const authHeader = req.header('Authorization');

  // 2. Verificar si no hay token
  if (!authHeader) {
    return res.status(401).json({
      status: 'fail',
      data: { message: 'No hay token, permiso denegado' }
    });
  }

  // El encabezado 'Authorization' usualmente es "Bearer <token>"
  // Hacemos un split y tomamos solo la parte del token
  const token = authHeader.split(' ')[1];

  // 3. Verificar si el token es válido
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      data: { message: 'Token no válido, permiso denegado' }
    });
  }

  try {
    // 4. Decodificar el token
    // Usamos la misma clave secreta con la que lo firmamos
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Adjuntar el payload del usuario (que solo tiene el ID)
    // al objeto 'req' para usarlo en nuestras rutas protegidas
    req.user = decoded.user;
    
    // Continuamos a la siguiente función (la ruta protegida)
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      data: { message: 'Token no es válido' }
    });
  }
};