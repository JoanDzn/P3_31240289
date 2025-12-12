const fs = require('fs');
const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: { title: 'Check', version: '1.0.0' }
};

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: [
    path.join(__dirname, '..', 'app.js'),
    path.join(__dirname, '..', 'routes', '*.js'),
    path.join(__dirname, '..', 'src', 'routes', '*.js')
  ]
};

try {
  const spec = swaggerJSDoc(swaggerOptions);
  fs.mkdirSync(path.join(__dirname, '..', 'tmp'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, '..', 'tmp', 'swagger.json'), JSON.stringify(spec, null, 2));
  console.log('Swagger spec generated successfully. Paths count:', Object.keys(spec.paths || {}).length);
} catch (err) {
  console.error('Error generating swagger spec:', err);
  process.exit(1);
}
