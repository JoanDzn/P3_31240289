// Archivo: test/auth.test.js

const request = require('supertest');
const app = require('../app');      // Importa tu app de Express
const db = require('../models');   // Importa tu 'db' de Sequelize

// --- Datos de Prueba Constantes ---
const testUser = {
  fullName: 'Test User',
  email: 'test@ejemplo.com',
  password: 'password123'
};

// --- Configuración de Pruebas ---

// 1. ANTES de cada prueba, borraremos y resincronizaremos la base de datos
//    Esto asegura que cada prueba inicie con una BD limpia.


// 2. DESPUÉS de todas las pruebas, cerramos la conexión de la BD
//    Esto evita que Jest se quede colgado.
afterAll(async () => {
  await db.sequelize.close();
});


// --- Requerimiento 5 - Parte 1: Pruebas de Autenticación ---

describe('Requerimiento 5 - Parte 1: Sistema de Autenticación', () => {
  beforeEach(async () => {
  await db.sequelize.sync({ force: true });
  });
  // --- Flujo de Éxito: Registro ---
  describe('POST /auth/register (Éxito)', () => {
    it('debería registrar un nuevo usuario y devolver 201', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send(testUser);

      // Verificamos el código de estado
      expect(res.statusCode).toBe(201);
      // Verificamos la respuesta JSend
      expect(res.body.status).toBe('success');
      // Verificamos que el usuario fue devuelto
      expect(res.body.data.user.email).toBe(testUser.email);
      // ¡Prueba de seguridad! Verifica que la contraseña NO se devuelva
      expect(res.body.data.user.password).toBeUndefined();
    });
  });

  // --- Escenario de Error: Email Duplicado ---
  describe('POST /auth/register (Error)', () => {
    it('debería fallar al registrar con un email duplicado y devolver 400', async () => {
      // 1. Registramos el usuario la primera vez
      await request(app)
        .post('/auth/register')
        .send(testUser);

      // 2. Intentamos registrarlo de nuevo con el mismo email
      const res = await request(app)
        .post('/auth/register')
        .send(testUser);

      // Verificamos el código de estado de error
      expect(res.statusCode).toBe(400);
      // Verificamos la respuesta JSend de 'fail'
      expect(res.body.status).toBe('fail');
      // Verificamos el mensaje de error
      expect(res.body.data[0].msg).toContain('El correo electrónico ya está en uso');
    });
  });

  // --- Flujo de Éxito: Login ---
  describe('POST /auth/login (Éxito)', () => {
    it('debería iniciar sesión y devolver un token JWT', async () => {
      // 1. Primero, registramos el usuario
      await request(app)
        .post('/auth/register')
        .send(testUser);

      // 2. Ahora, intentamos iniciar sesión
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      // Verificamos que la respuesta contenga un token
      expect(res.body.data.token).toBeDefined();
    });
  });

  // --- Escenario de Error: Credenciales Incorrectas ---
  describe('POST /auth/login (Error)', () => {
    it('debería fallar con credenciales incorrectas y devolver 400', async () => {
      // 1. Registramos el usuario
      await request(app)
        .post('/auth/register')
        .send(testUser);

      // 2. Intentamos iniciar sesión con contraseña INCORRECTA
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'password_incorrecta'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.data.message).toBe('Credenciales inválidas');
    });
  });

});


// --- Requerimiento 5 - Parte 2: Pruebas de Rutas Protegidas ---

describe('Requerimiento 5 - Parte 2: Rutas Protegidas (GET /users)', () => {
  
  let token; // Variable para guardar nuestro token de sesión

  // Antes de estas pruebas, registraremos y haremos login UNA VEZ
  beforeAll(async () => {
    // 1. Borramos todo
    await db.sequelize.sync({ force: true });
    
    // 2. Registramos
    await request(app)
      .post('/auth/register')
      .send(testUser);
    
    // 3. Hacemos login y guardamos el token
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    
    token = res.body.data.token; // Guardamos el token
  });

  // --- Escenario de Error: Sin Token ---
  it('debería denegar el acceso sin token y devolver 401', async () => {
    const res = await request(app)
      .get('/users'); // <--- Sin encabezado 'Authorization'

    expect(res.statusCode).toBe(401);
    expect(res.body.data.message).toContain('No hay token');
  });

  // --- Escenario de Error: Token Inválido ---
  it('debería denegar el acceso con un token inválido y devolver 401', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', 'Bearer tokenfalso12345'); // <--- Token falso

    expect(res.statusCode).toBe(401);
    expect(res.body.data.message).toContain('Token no es válido');
  });

  // --- Flujo de Éxito: Con Token ---
  it('debería permitir el acceso con un token válido y devolver 200', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`); // <--- Usamos el token real

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    // Verificamos que devuelve la lista de usuarios
    expect(Array.isArray(res.body.data.users)).toBe(true);
    expect(res.body.data.users[0].email).toBe(testUser.email);
  });

});