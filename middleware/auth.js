// Archivo: middleware/auth.js

const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Obtener el token desde varias ubicaciones posibles (header, x-auth-token, query)
  // Esto facilita las pruebas desde el navegador o herramientas que no establecen
  // el header 'Authorization' con el prefijo 'Bearer'.
  const authHeader = req.header('Authorization');
  const xAuthToken = req.header('x-auth-token');
  const tokenQuery = req.query && req.query.token;

  // No hay token en ninguna fuente
  if (!authHeader && !xAuthToken && !tokenQuery) {
    return res.status(401).json({
      status: 'fail',
      data: { message: 'No hay token, permiso denegado' }
    });
  }

  // Si viene en Authorization puede ser "Bearer <token>" o solo el token.
  let token = null;
  if (authHeader) {
    const parts = authHeader.split(' ');
    token = parts.length === 2 ? parts[1] : parts[0];
  } else if (xAuthToken) {
    token = xAuthToken;
  } else if (tokenQuery) {
    token = tokenQuery;
  }

  // 3. Verificar si el token es válido (presente)
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