import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const JWT_AUTH = 'JWT-auth';

export function setupSwagger(app: INestApplication) {
  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Calculadora API')
    .setDescription('API para sistema de calculadora')
    .setVersion('1.0')
    .addTag('auth', 'Endpoints de autenticação')
    .addTag('users', 'Endpoints de usuários')
    .addTag('calculo', 'Endpoints de cálculo')
    .addTag('email', 'Envio de e-mail')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      JWT_AUTH, // Este nome será usado nos decorators
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/swagger.json', (req, res) => {
    res.json(document);
  });

  SwaggerModule.setup('api', app, document);
}
