const request = require('supertest');
const app = require('../app'); // <--- CORREGIDO (antes decía ../src/app)
const { sequelize } = require('../models'); // <--- CORREGIDO (antes decía ../src/models)

describe('Gestión de Categorías y Tags', () => {
  let adminToken;

  beforeAll(async () => {
    // Sincronizar DB limpiando todo
    await sequelize.sync({ force: true });
    
    // Crear usuario
    await request(app).post('/auth/register').send({
      fullName: 'Admin Test',
      email: 'admin@test.com',
      password: 'password123'
    });

    // Loguear
    const res = await request(app).post('/auth/login').send({
      email: 'admin@test.com',
      password: 'password123'
    });
    adminToken = res.body.data.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('POST /categories - Debería fallar sin Token (401)', async () => {
    const res = await request(app).post('/categories').send({
      name: 'Motores',
      description: 'Partes internas'
    });
    expect(res.statusCode).toEqual(401);
  });

  test('POST /categories - Debería crear categoría con Token (201)', async () => {
    const res = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Motores',
        description: 'Partes internas'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.data.category.name).toBe('Motores');
  });

  test('POST /tags - Debería crear tag con Token (201)', async () => {
    const res = await request(app)
      .post('/tags')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Oferta' });
    expect(res.statusCode).toEqual(201);
    expect(res.body.data.tag.name).toBe('Oferta');
  });
});