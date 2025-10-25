require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var swaggerJSDoc = require('swagger-jsdoc');
var swaggerUi = require('swagger-ui-express');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');

var app = express();

// ... (configuración de vistas, 'view engine setup')

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --- SECCIÓN DE RUTAS ---
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

// Swagger setup
var swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Proyecto programacion 3',
    version: '1.0.0',
    description: 'Documentación de la API del proyecto'
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'El ID autoincremental del usuario.', example: 1 },
          fullName: { type: 'string', description: 'El nombre completo del usuario.', example: 'Joan Jose Garcia' },
          email: { type: 'string', description: 'El email único del usuario.', example: 'joan@ejemplo.com' },
          createdAt: { type: 'string', format: 'date-time', description: 'Fecha de creación.' },
          updatedAt: { type: 'string', format: 'date-time', description: 'Fecha de última actualización.' }
        }
      },
      UserRegister: {
        type: 'object',
        properties: {
          fullName: { type: 'string', example: 'Joan Jose Garcia' },
          email: { type: 'string', example: 'joan@ejemplo.com' },
          password: { type: 'string', format: 'password', example: 'claveSegura123' }
        },
        required: ['fullName', 'email', 'password']
      },
      UserLogin: {
        type: 'object',
        properties: {
          email: { type: 'string', example: 'joan@ejemplo.com' },
          password: { type: 'string', format: 'password', example: 'claveSegura123' }
        },
        required: ['email', 'password']
      },
      AuthToken: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'El token JWT para autenticación.', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
        }
      },
      JSendFail: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'fail' },
          data: { type: 'object', description: 'Objeto o array con los errores de validación.' }
        }
      }
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: "Token de autenticación JWT (Bearer). Introduce 'Bearer' [espacio] y luego tu token."
      }
    }
  },
  tags: [
    { name: 'Información', description: 'Endpoints públicos de información del servidor.' },
    { name: 'Autenticación', description: 'Endpoints para registro e inicio de sesión.' },
    { name: 'Usuarios (Gestión)', description: 'CRUD para la gestión de usuarios. Requiere token JWT.' }
  ]
};

var swaggerOptions = {
  definition: swaggerDefinition,
  apis: [
    path.join(__dirname, 'app.js'),
    path.join(__dirname, 'routes', 'auth.js'),
    path.join(__dirname, 'routes', 'users.js')
  ]
};

/**
 * @openapi
 * /components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: El ID autoincremental del usuario.
 *           example: 1
 *         fullName:
 *           type: string
 *           description: El nombre completo del usuario.
 *           example: Joan Jose Garcia
 *         email:
 *           type: string
 *           description: El email único del usuario.
 *           example: joan@ejemplo.com
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización.
 *     UserRegister:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *           description: El nombre completo del usuario.
 *           example: Joan Jose Garcia
 *         email:
 *           type: string
 *           description: El email único del usuario.
 *           example: joan@ejemplo.com
 *         password:
 *           type: string
 *           format: password
 *           description: Contraseña (min 6 caracteres).
 *           example: claveSegura123
 *     UserLogin:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: joan@ejemplo.com
 *         password:
 *           type: string
 *           format: password
 *           example: claveSegura123
 *     AuthToken:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: El token JWT para autenticación.
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     JSendFail:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: fail
 *         data:
 *           type: object
 *           description: Objeto o array con los errores de validación.
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: "Token de autenticación JWT (Bearer). Introduce 'Bearer' [espacio] y luego tu token."
 * tags:
 *   - name: Información
 *     description: Endpoints públicos de información del servidor.
 *   - name: Autenticación
 *     description: Endpoints para registro e inicio de sesión.
 *   - name: Usuarios (Gestión)
 *     description: (Protegido) CRUD para la gestión de usuarios. Requiere token JWT.
 */

var swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
* @openapi
* /about:
*    get:
*      tags: [Información]
*      summary: Información del estudiante (autor del codigo)
*      description: Devuelve información básica del autor (nombre, cédula, sección).
*      responses:
*       '200':
*          description: Objeto JSON con los datos del autor
*          content:
*            application/json:
*              schema:
*                 type: object
*                 properties:
*                   success:
*                     type: string
*                     example: success
*                   datos:
*                     type: object
*                     properties:
*                       name:
*                         type: string
*                         example: Joan Jose Garcia Valenzuela
*                       cedula:
*                         type: string
*                         example: "31.240.289"
*                       seccion:
*                         type: string
*                         example: "2"
*/

app.get('/about', function(req, res) {
  res.json({
    success: "success",
    datos: {
      name: "Joan Jose Garcia Valenzuela",
      cedula: "31.240.289",
      seccion: "2"
    }
  });
});

/**
 * @openapi
 * /ping:
 *    get:
 *      tags: [Información]
 *      summary: Ping
 *      description: Endpoint para comprobar que el servidor está activo. Responde 200 sin contenido.
 *      responses:
 *        '200':
 *          description: OK
 */
app.get('/ping', function(req, res) {
  res.status(200).end();
})


/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Autenticación
 *     summary: Registra un nuevo usuario
 *     description: Endpoint público para crear una nueva cuenta de usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       '201':
 *         description: Usuario creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       '400':
 *         description: Error de validación (ej. email duplicado).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Autenticación
 *     summary: Inicia sesión de un usuario
 *     description: Autentica a un usuario con email y contraseña, y devuelve un token JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       '200':
 *         description: Login exitoso, devuelve token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/AuthToken'
 *       '400':
 *         description: Credenciales inválidas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 */


/**
 * @openapi
 * /users:
 *   get:
 *     tags:
 *       - Usuarios (Gestión)
 *     summary: Obtiene la lista de todos los usuarios
 *     description: Ruta protegida. Devuelve un array de todos los usuarios en la BD.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de usuarios obtenida.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       '401':
 *         description: No autorizado (token no válido o no provisto).
 */


/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags:
 *       - Usuarios (Gestión)
 *     summary: Obtiene un usuario por su ID
 *     description: Ruta protegida. Devuelve un solo usuario.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: El ID numérico del usuario a buscar.
 *     responses:
 *       '200':
 *         description: Usuario encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       '401':
 *         description: No autorizado.
 *       '404':
 *         description: Usuario no encontrado.
 */

/**
 * @openapi
 * /users:
 *   post:
 *     tags:
 *       - Usuarios (Gestión)
 *     summary: Crea un nuevo usuario (Ruta de Admin)
 *     description: Ruta protegida. Permite a un admin crear un nuevo usuario (diferente de /auth/register).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       '201':
 *         description: Usuario creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       '400':
 *         description: Error de validación.
 *       '401':
 *         description: No autorizado.
 */


/**
 * @openapi
 * /users/{id}:
 *   put:
 *     tags:
 *       - Usuarios (Gestión)
 *     summary: Actualiza un usuario
 *     description: Ruta protegida. Actualiza el fullName o email de un usuario.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: El ID numérico del usuario a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Joan Jose (Actualizado)
 *               email:
 *                 type: string
 *                 example: joan.nuevo@ejemplo.com
 *     responses:
 *       '200':
 *         description: Usuario actualizado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       '401':
 *         description: No autorizado.
 *       '404':
 *         description: Usuario no encontrado.
 */

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     tags:
 *       - Usuarios (Gestión)
 *     summary: Elimina un usuario
 *     description: Ruta protegida. Elimina un usuario de la base de datos.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: El ID numérico del usuario a eliminar.
 *     responses:
 *       '200':
 *         description: Usuario eliminado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   nullable: true
 *                   example: null
 *       '401':
 *         description: No autorizado.
 *       '404':
 *         description: Usuario no encontrado.
 */

app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Devuelve el error en formato JSON (estilo JSend)
  res.status(err.status || 500);
  res.json({
    status: 'error',
    message: err.message
  });
});

module.exports = app;