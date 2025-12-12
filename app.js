require('dotenv').config();

// Ensure a JWT secret exists for signing tokens. During tests NODE_ENV === 'test',
// so provide a default test secret when none is configured to avoid jwt errors.
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'test') {
    process.env.JWT_SECRET = 'test_jwt_secret';
  } else {
    process.env.JWT_SECRET = 'dev_jwt_secret';
    console.warn("JWT_SECRET not set; using default 'dev_jwt_secret' (not for production).");
  }
}
var ordersRouter = require('./src/routes/orders');
var publicRouter = require('./routes/public');
var productsRouter = require('./routes/products');
var categoriesRouter = require('./routes/categories');
var tagsRouter = require('./routes/tags');
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
var { sequelize } = require('./models');
var app = express();

// Sincronizar modelos con la DB
if (process.env.NODE_ENV !== 'test') {
  sequelize.sync({ alter: true })
    .then(() => {
      console.log('✅ Tablas sincronizadas (Users, Products, Categories, Tags)');
    })
    .catch((err) => {
      console.error('❌ Error de sincronización:', err);
    });
}
// ... (configuración de vistas, 'view engine setup')

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --- SECCIÓN DE RUTAS ---
app.use('/', publicRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/categories', categoriesRouter);
app.use('/tags', tagsRouter);
app.use('/products', productsRouter);
app.use('/orders', ordersRouter);
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
    { name: 'Usuarios (Gestión)', description: 'CRUD para la gestión de usuarios. Requiere token JWT.' },
    { name: 'Categorías', description: '(Protegido) Gestión de categorías.' },
    { name: 'Admin - Productos', description: '(Protegido) Gestión de inventario.' },
    { name: 'Público - Productos', description: '(Público) Buscador y catálogo para clientes.' },
    { name: 'Tags', description: 'Gestión de etiquetas (Tags).' },
    { name: 'Orders', description: 'Gestión de Órdenes y Proceso de Checkout (Transaccional)' }
  ]
};

var swaggerOptions = {
  definition: swaggerDefinition,
  apis: [
    path.join(__dirname, 'app.js'),
    path.join(__dirname, 'routes', 'auth.js'),
    path.join(__dirname, 'routes', 'users.js'),
    path.join(__dirname, 'routes', 'categories.js'),
    path.join(__dirname, 'routes', 'tags.js'),
    path.join(__dirname, 'src', 'routes', 'orders.js'),
    path.join(__dirname, 'routes', 'products.js'),
    path.join(__dirname, 'routes', 'public.js')
  ]
};

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: "Token de autenticación JWT (Bearer). Introduce 'Bearer' [espacio] y luego tu token."
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
 *       required:
 *         - fullName
 *         - email
 *         - password
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
 *       required:
 *         - email
 *         - password
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
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Frenos"
 *         description:
 *           type: string
 *           example: "Sistemas de frenado"
 *     Tag:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Oferta"
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Kit de Tiempo Bera SBR"
 *         slug:
 *           type: string
 *           example: "kit-de-tiempo-bera-sbr"
 *         description:
 *           type: string
 *           example: "Kit completo con cadena"
 *         price:
 *           type: number
 *           example: 15.99
 *         stock:
 *           type: integer
 *           example: 50
 *         brand:
 *           type: string
 *           example: "Bera Genuine"
 *         compatibility:
 *           type: string
 *           example: "SBR 2024"
 *         category:
 *           $ref: '#/components/schemas/Category'
 *         tags:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Tag'
 *     ProductInput:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - brand
 *         - categoryId
 *       properties:
 *         name:
 *           type: string
 *           example: "Kit de Tiempo Bera SBR"
 *         description:
 *           type: string
 *           example: "Kit completo"
 *         price:
 *           type: number
 *           example: 15.99
 *         stock:
 *           type: integer
 *           example: 50
 *         brand:
 *           type: string
 *           example: "Bera Genuine"
 *         compatibility:
 *           type: string
 *           example: "SBR 2024"
 *         categoryId:
 *           type: integer
 *           example: 1
 *         tags:
 *           type: array
 *           items:
 *             type: integer
 *           example: [1, 2]
 *     CheckoutInput:
 *       type: object
 *       required:
 *         - items
 *         - paymentMethod
 *         - paymentDetails
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *         paymentMethod:
 *           type: string
 *           example: "CreditCard"
 *         paymentDetails:
 *           type: object
 *           properties:
 *             cardNumber:
 *               type: string
 *             cvv:
 *               type: string
 *             expMonth:
 *               type: string
 *             expYear:
 *               type: string
 *             cardHolder:
 *               type: string
 *             currency:
 *               type: string
 *       example:
 *         items:
 *           - id: 1
 *             quantity: 2
 *         paymentMethod: "CreditCard"
 *         paymentDetails:
 *           cardNumber: "4111111111111111"
 *           cvv: "123"
 *           expMonth: "12"
 *           expYear: "2030"
 *           cardHolder: "APPROVED"
 *           currency: "USD"
 * tags:
 *   - name: Información
 *     description: Endpoints públicos de información del servidor.
 *   - name: Autenticación
 *     description: Endpoints para registro e inicio de sesión.
 *   - name: Usuarios (Gestión)
 *     description: (Protegido) CRUD para la gestión de usuarios.
 *   - name: Categorías
 *     description: (Protegido) Gestión de categorías.
 *   - name: Admin - Productos
 *     description: (Protegido) Gestión de inventario.
 *   - name: Público - Productos
 *     description: (Público) Buscador y catálogo para clientes.
 */



var swaggerSpec = swaggerJSDoc(swaggerOptions);

// Reorder tags and paths to ensure 'Tags' appears before 'Orders' in the UI.
// Some versions of Swagger UI still render sections according to path order,
// so we reorder the spec.paths to put paths that mention the 'Tags' tag first.
try {
  // Ensure tags array exists
  if (Array.isArray(swaggerSpec.tags)) {
    // Place 'Tags' immediately after the 'Categorías' tag (or 'Categorias' fallback)
    const idxTags = swaggerSpec.tags.findIndex(t => t.name === 'Tags');
    const idxCategories = swaggerSpec.tags.findIndex(t => typeof t.name === 'string' && (t.name === 'Categorías' || t.name === 'Categorias' || t.name.toLowerCase().includes('categor')));
    if (idxTags !== -1) {
      const tagObj = swaggerSpec.tags.splice(idxTags, 1)[0];
      const targetIndex = idxCategories !== -1 ? (idxCategories + 1) : Math.max(0, swaggerSpec.tags.length - 1);
      swaggerSpec.tags.splice(Math.min(targetIndex, swaggerSpec.tags.length), 0, tagObj);
    }

    // Ensure 'Orders' is the last tag (so 'Tags' stays after Categories)
    const idxOrders = swaggerSpec.tags.findIndex(t => t.name === 'Orders');
    if (idxOrders !== -1) {
      const ordersObj = swaggerSpec.tags.splice(idxOrders, 1)[0];
      swaggerSpec.tags.push(ordersObj);
    }
  }

  // Reorder paths: collect paths that include operations tagged with 'Tags' first
  const paths = swaggerSpec.paths || {};
  const pathKeys = Object.keys(paths);
  const newPaths = {};

  // helper to check if a path has operations with a given tag
  function pathHasTag(pathObj, tagName) {
    return Object.values(pathObj).some(op => Array.isArray(op.tags) && op.tags.includes(tagName));
  }

  // Reorder paths: others first, then Category paths, then Tag paths, then Orders
  pathKeys.forEach(k => {
    if (!pathHasTag(paths[k], 'Tags') && !pathHasTag(paths[k], 'Orders') && !pathHasTag(paths[k], 'Categorías') && !pathHasTag(paths[k], 'Categorias')) {
      newPaths[k] = paths[k];
    }
  });

  // Category-related paths
  pathKeys.forEach(k => {
    if (!newPaths[k] && (pathHasTag(paths[k], 'Categorías') || pathHasTag(paths[k], 'Categorias') || pathHasTag(paths[k], 'Categories'))) {
      newPaths[k] = paths[k];
    }
  });

  // Then add paths that reference the 'Tags' tag
  pathKeys.forEach(k => {
    if (!newPaths[k] && pathHasTag(paths[k], 'Tags')) {
      newPaths[k] = paths[k];
    }
  });

  // Finally add paths that reference 'Orders'
  pathKeys.forEach(k => {
    if (!newPaths[k] && pathHasTag(paths[k], 'Orders')) {
      newPaths[k] = paths[k];
    }
  });

  swaggerSpec.paths = newPaths;
} catch (err) {
  console.error('Error reordering swaggerSpec:', err);
}

// Configure Swagger UI to NOT sort tags/operations automatically so the
// order in `swaggerDefinition.tags` is preserved in the UI.
// Use `null` for the sorters to disable any automatic ordering.
var swaggerUiOptions = {
  swaggerOptions: {
    tagsSorter: null,
    operationsSorter: null
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}

module.exports = app;