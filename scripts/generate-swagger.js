const { NestFactory } = require('@nestjs/core');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const { AppModule } = require('../dist/src/app.module');
const fs = require('fs');
const path = require('path');

async function generateSwagger() {
  try {
    console.log('🚀 Starting Swagger documentation generation...');

    const app = await NestFactory.create(AppModule, {
      logger: false, // Disable logging for cleaner output
    });

    const config = new DocumentBuilder()
      .setTitle('LMS Backend API')
      .setDescription('Learning Management System Backend API Documentation')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Authentication', 'User authentication and authorization')
      .addTag(
        'Content Management',
        'Manage grades, subjects, chapters, and subchapters',
      )
      .addTag('Quiz Management', 'Create and manage quizzes and questions')
      .addTag('AI Services', 'AI-powered content generation and chat')
      .addTag('Progress Tracking', 'Track user learning progress')
      .addTag(
        'Unreal Engine Integration',
        'Metahuman and Unreal Engine features',
      )
      .addServer('http://localhost:3000', 'Development server')
      .addServer('https://api.zonaajar.com', 'Production server')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // Save as JSON
    const jsonPath = path.resolve(process.cwd(), 'swagger.json');
    fs.writeFileSync(jsonPath, JSON.stringify(document, null, 2));

    console.log('✅ Swagger documentation generated successfully!');
    console.log(`📄 JSON: ${jsonPath}`);

    // Count endpoints
    const paths = Object.keys(document.paths || {});
    const totalEndpoints = paths.reduce((count, path) => {
      return count + Object.keys(document.paths[path]).length;
    }, 0);

    console.log(`📊 Total endpoints documented: ${totalEndpoints}`);
    console.log(`📊 Total paths: ${paths.length}`);

    // List all endpoints by tag
    const endpointsByTag = {};
    paths.forEach((path) => {
      Object.keys(document.paths[path]).forEach((method) => {
        const operation = document.paths[path][method];
        const tags = operation.tags || ['Untagged'];
        tags.forEach((tag) => {
          if (!endpointsByTag[tag]) endpointsByTag[tag] = [];
          endpointsByTag[tag].push(`${method.toUpperCase()} ${path}`);
        });
      });
    });

    console.log('\n📋 Endpoints by category:');
    Object.keys(endpointsByTag)
      .sort()
      .forEach((tag) => {
        console.log(`\n🏷️  ${tag}:`);
        endpointsByTag[tag].forEach((endpoint) => {
          console.log(`   ${endpoint}`);
        });
      });

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating Swagger documentation:', error);
    process.exit(1);
  }
}

generateSwagger();
