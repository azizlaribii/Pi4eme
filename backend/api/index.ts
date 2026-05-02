// api/index.ts - COMPLETE FIXED VERSION
import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import cookieParser from 'cookie-parser';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from '../src/app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true
    }));

    await app.listen(3000);
    Logger.log('API ready for Vercel!');

    // ✅ EXPORT FOR VERCEL
    return app;
}

// ✅ VERCEL HANDLER - THIS IS REQUIRED!
export default async function handler(req: any, res: any) {
    const app = await bootstrap();

    return new Promise<void>((resolve) => {
        const server = app.getHttpAdapter().getInstance();
        server.emit('request', req, res);
        server.close(() => resolve());
    });
}