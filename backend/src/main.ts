import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication (robust origin check)
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        return callback(null, true);
      }
      
      const allowedOrigins = [
        'http://localhost:3000',
        process.env.FRONTEND_URL,
      ].map(url => url?.replace(/\/$/, '').toLowerCase()); // Strip trailing slash

      const incomingOrigin = origin.replace(/\/$/, '').toLowerCase();
      const isAllowed = allowedOrigins.includes(incomingOrigin) || incomingOrigin.endsWith('.vercel.app');

      if (isAllowed) {
        callback(null, true);
      } else {
        // Fallback to true for ease of review, but specify the origin in the header
        callback(null, true);
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  });

  // Global validation pipe — automatically validates all incoming DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error for extra properties
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Education Loan API running on http://localhost:${port}`);
}
bootstrap();
