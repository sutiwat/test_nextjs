import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe for DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // ลบคุณสมบัติที่ไม่รู้จักออกจาก payload
    forbidNonWhitelisted: true, // ไม่อนุญาตให้มีคุณสมบัติที่ไม่รู้จัก
    transform: true, // แปลง payload เป็น instance ของ DTO
  }));

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Encryption/Decryption API')
    .setDescription('API for encrypting and decrypting data using RSA and AES')
    .setVersion('1.0')
    .addTag('Encryption/Decryption')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // Path for Swagger UI

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger UI available at: ${await app.getUrl()}/api-docs`);
}
bootstrap();
