var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var swaggerJSDoc = require('swagger-jsdoc');
var swaggerUi = require('swagger-ui-express');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Swagger setup: generate spec from JSDoc comments in this file
var swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Proyecto programacion 3',
    version: '1.0.0',
    description: 'Documentación de la API del proyecto'
  }
};

var swaggerOptions = {
  definition: swaggerDefinition,
  apis: [path.join(__dirname, 'app.js')]
};

var swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


/**
 * @openapi
 * /about:
 *   get:
 *     summary: Información del estudiante (autor del codigo)
 *     description: Devuelve información básica del autor (nombre, cédula, sección).
 *     responses:
 *       200:
 *         description: Objeto JSON con los datos del autor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                   example: success
 *                 datos:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Joan Jose Garcia Valenzuela
 *                     cedula:
 *                       type: string
 *                       example: 31.240.289
 *                     seccion:
 *                       type: string
 *                       example: 2
 */
app.get('/about',function(req, res){
  res.json({
    success: "success",
    datos: {
        name: "Joan Jose Garcia Valenzuela",
        cedula:"31.240.289",
        seccion:"2"
    }});
});

/**
 * @openapi
 * /ping:
 *   get:
 *     summary: Ping
 *     description: Endpoint para comprobar que el servidor está activo. Responde 200 sin contenido.
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/ping',function(req, res){
  res.status(200).end();
})
module.exports = app;
