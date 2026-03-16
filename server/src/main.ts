import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

/**
 * Nest 应用启动入口。
 *
 * 可以把这里理解成“后端总装配 + 全局开关”的地方：
 * 1. 创建应用实例（把 AppModule 作为整个应用的根模块）
 * 2. 注册全局能力，例如参数校验、异常处理、统一响应格式
 * 3. 配置 Swagger、CORS、静态资源等运行时能力
 * 4. 监听端口，开始对外提供 HTTP 服务
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
  });

  // 提高请求体大小限制（支持 Base64 图片上传）
  app.useBodyParser('json', { limit: '20mb' });
  app.useBodyParser('urlencoded', { limit: '20mb', extended: true });

  // 全局校验管道
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: 只保留 DTO 中声明过的字段，多余字段会被自动剔除
      whitelist: true,
      // forbidNonWhitelisted: 如果传了 DTO 里不存在的字段，直接报错而不是默默忽略
      forbidNonWhitelisted: true,
      // transform: 让 Nest 按 DTO 类型把原始字符串参数转换成目标类型
      transform: true,
    }),
  );

  // 全局异常过滤器
  // Controller / Service 里抛出的异常，最终都会先经过这里，再转换成统一错误响应
  app.useGlobalFilters(new AllExceptionsFilter());

  // 全局响应拦截器（统一 {code, data, msg} 格式）
  // 所以 Controller 里通常只需要 return 业务数据，不需要手动包一层成功响应
  app.useGlobalInterceptors(new TransformInterceptor());

  // 跨域
  // 前端开发时通常和后端不是同一个端口，因此需要允许跨域访问
  app.enableCors();

  // 静态文件托管（用于临时图片等）
  // 例如 uploads/fridge/xxx.jpg 最终可以通过 /uploads/fridge/xxx.jpg 访问
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Swagger API 文档
  // 这属于应用启动阶段的一次性配置，所以统一放在 bootstrap 中
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ChefMate API')
    .setDescription('ChefMate 智能家庭烹饪助手 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 ChefMate server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
