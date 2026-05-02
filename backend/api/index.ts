import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

let cachedApp: any;

export default async (req: any, res: any) => {
    if (!cachedApp) {
        cachedApp = await NestFactory.create(AppModule);
        cachedApp.enableCors();
        await cachedApp.init();
    }

    const server = cachedApp.getHttpServer();
    server.emit('request', req, res);
};