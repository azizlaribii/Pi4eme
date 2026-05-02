// api/index.ts - COMPLETE FIXED VERSION
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { ValidationPipe, Logger, INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

process.removeAllListeners('warning');

let cachedApp: INestApplication;

async function bootstrap() {
    if (!cachedApp) {
        cachedApp = await NestFactory.create(AppModule);

        cachedApp.use(cookieParser());
        cachedApp.useGlobalPipes(new ValidationPipe({
            transform: true,
            whitelist: true
        }));

        await cachedApp.init(); // 👈 Use init() for serverless, not listen()
        Logger.log('API initialized for Vercel!');
    }
    return cachedApp;
}

// ✅ VERCEL HANDLER
export default async function handler(req: any, res: any) {
    const app = await bootstrap();
    const server = app.getHttpAdapter().getInstance();
    
    // Pass the request directly to the Express instance
    server(req, res);
}