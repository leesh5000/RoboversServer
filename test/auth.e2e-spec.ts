import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/auth/sign-up (POST)', () => {
    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({
          email: 'invalid-email',
          password: 'password123',
          nickname: '테스트유저'
        })
        .expect(400);
    });

    it('should return 400 for short password', () => {
      return request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({
          email: 'test@example.com',
          password: 'short',
          nickname: '테스트유저'
        })
        .expect(400);
    });

    it('should return 400 for invalid nickname', () => {
      return request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({
          email: 'test@example.com',
          password: 'password123',
          nickname: 'a' // 너무 짧음
        })
        .expect(400);
    });
  });
});