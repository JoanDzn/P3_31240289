const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');

describe('Sistema de Productos', () => {
  let token;
  let categoryId;
  let tagId;

  beforeAll(async () => {
    // Sincronizar DB
    await sequelize.sync({ force: true });
    
    // 1. Registro
    const regRes = await request(app).post('/auth/register').send({
      fullName: 'Tester', email: 'test@prod.com', password: '123'
    });
    // Si falla el registro, imprimimos el error para saber qué pasó
    if (regRes.statusCode !== 201) console.error('Error Registro:', regRes.body);

    // 2. Login
    const loginRes = await request(app).post('/auth/login').send({
      email: 'test@prod.com', password: '123'
    });
    // Si falla el login, imprimimos el error
    if (loginRes.statusCode !== 200) console.error('Error Login:', loginRes.body);
    
    token = loginRes.body.data ? loginRes.body.data.token : null;

    // 3. Crear Categoría Base
    const catRes = await request(app).post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Frenos', description: 'Sistemas de frenado' });
    
    // AQUÍ OCURRÍA EL ERROR ANTES. Ahora validamos:
    if (catRes.statusCode !== 201) {
      console.error('Error creando Categoría:', catRes.body); // Veremos el error real
      categoryId = null;
    } else {
      categoryId = catRes.body.data.category.id;
    }

    // 4. Crear Tag Base
    const tagRes = await request(app).post('/tags')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Original' });
    
    if (tagRes.statusCode === 201) {
      tagId = tagRes.body.data.tag.id;
    }
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('POST /products - Crear producto con relaciones', async () => {
    // Si falló la configuración inicial, esta prueba fallará con un mensaje claro
    if (!token || !categoryId) {
      throw new Error("No se pudo configurar el entorno (Falta Token o Categoría)");
    }

    const res = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Pastilla Bera SBR',
        description: 'Pastilla cerámica',
        price: 10.50,
        stock: 20,
        brand: 'Bera Genuine',
        categoryId: categoryId,
        tags: [tagId],
        compatibility: 'SBR'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.data.product.slug).toBe('pastilla-bera-sbr');
  });

  test('GET /products - Búsqueda por texto', async () => {
    const res = await request(app).get('/products?search=Cerámica');
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.products.length).toBe(1);
  });

  test('GET /p/:id-:slug - Redirección 301 si el slug está mal', async () => {
    const res = await request(app).get('/p/1-slug-incorrecto');
    expect(res.statusCode).toEqual(301);
    expect(res.header.location).toContain('/p/1-pastilla-bera-sbr');
  });
});