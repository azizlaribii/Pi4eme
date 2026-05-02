import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express from 'express';
import cookieParser from 'cookie-parser';

let cachedApp: NestExpressApplication;

export default async function handler(req: any, res: any) {
    try {
        // Create app on cold start
        if (!cachedApp) {
            cachedApp = await NestFactory.create<NestExpressApplication>(
                AppModule,
                {
                    logger: ['error', 'warn'], // Reduce logs in serverless
                    bodyParser: false // Handle manually for file uploads
                }
            );

            cachedApp.enableCors({
                origin: '*', // Adjust for production
                credentials: true
            });

            cachedApp.use(cookieParser());
            cachedApp.use(express.json({ limit: '10mb' }));
            cachedApp.use(express.urlencoded({ extended: true, limit: '10mb' }));

            await cachedApp.init();
        }

        // Handle request
        const server = cachedApp.getHttpServer();
        server.emit('request', req, res);

    } catch (error) {
        console.error('Handler error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
