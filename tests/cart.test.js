//jest.mock('@sentry/profiling-node');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index'); // Asegúrate de que el archivo principal de tu aplicación se exporte correctamente

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Cart API', () => {
  let cartId;

  it('should create a new cart', async () => {
    const res = await request(app)
      .post('/api/carts')
      .send({
        userId: 'testuser123',
        products: [{ productId: 'product123', quantity: 2 }],
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    cartId = res.body._id;
  });

  it('should update a cart', async () => {
    const res = await request(app)
      .put(`/api/carts/${cartId}`)
      .send({
        products: [{ productId: 'product123', quantity: 3 }],
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.products[0].quantity).toBe(3);
  });

  it('should get all carts', async () => {
    const res = await request(app).get('/api/carts');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should delete a cart', async () => {
    const res = await request(app).delete(`/api/carts/${cartId}`);
    expect(res.statusCode).toEqual(204);
  });
});
