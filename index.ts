
import fastify from './src/middleware/jwt';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import {  LoginUserRoute } from './src/routes/auth';
import { ChatRoute } from './src/routes/chatBot';
import { AnalyticsRoute } from './src/routes/analytics';
import { SettingsRoute } from './src/routes/settings';
import { BookingRoute } from './src/routes/booking';

const start = async () => {
  try {
    await fastify.register(swagger, {
      openapi: {
        openapi: '3.0.3',
        info: {
          title: 'Mental Health Chatbot API',
          description: 'API documentation for the mental health chatbot backend.',
          version: '1.0.0',
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
    })

    await fastify.register(swaggerUI, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
    })

    fastify.get('/',{
      preHandler: [fastify.authenticate],
    }, async (request:any, reply:any) => {
      return { hello: 'world' }
    })

    fastify.get('/jwt', async (request:any, reply:any) => {
      console.log("Hi")
      return reply.status(200).send({ hello: 'world' })
    })
    await fastify.register(LoginUserRoute,{prefix:"/api/auth"})
    await fastify.register(ChatRoute,{prefix:"/api/chatbot"})
    await fastify.register(AnalyticsRoute,{prefix:"/api/analytics"})
    await fastify.register(SettingsRoute,{prefix:"/api/settings"})
    await fastify.register(BookingRoute,{prefix:"/api/bookings"})

    await fastify.listen({ port: 5000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }

  
}
start()