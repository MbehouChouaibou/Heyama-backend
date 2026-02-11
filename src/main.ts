import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import { ValidationPipe } from '@nestjs/common';   ← optional but recommended

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Optional: enable validation globally (very useful with DTOs)
  // app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // ── Swagger setup ────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Your API Title')               // ← customize
    .setDescription('The API description here')
    .setVersion('1.0')
    // .addBearerAuth()                       // ← uncomment if you use JWT
    // .addTag('users', 'Everything about users')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    // Optional nice defaults (you can remove or customize)
    swaggerOptions: {
      persistAuthorization: true,           // keeps token after refresh
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customCss: '.swagger-ui .topbar { display: none }', // hides top bar if you want
  });
  // ─────────────────────────────────────────────────────────────────

  const port = process.env.PORT || 3000;
await app.listen(port, '0.0.0.0');            // ← correct for Docker
console.log(`Application is running on: http://0.0.0.0:${port}`);

}
bootstrap();