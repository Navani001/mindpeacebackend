
import fastify from './src/middleware/jwt';
import {  LoginUserRoute } from './src/routes/auth';
import { ChatRoute } from './src/routes/chatBot';
import { AnalyticsRoute } from './src/routes/analytics';
import { SettingsRoute } from './src/routes/settings';

fastify.get('/',{
            preHandler: [fastify.authenticate],
        }, async (request:any, reply:any) => {
  return { hello: 'world' }
})
fastify.get('/jwt', async (request:any, reply:any) => {
  console.log("Hi")
  return reply.status(200).send({ hello: 'world' })
})
fastify.register(LoginUserRoute,{prefix:"/api/auth"})
fastify.register(ChatRoute,{prefix:"/api/chatbot"})
fastify.register(AnalyticsRoute,{prefix:"/api/analytics"})
fastify.register(SettingsRoute,{prefix:"/api/settings"})
const start = async () => {
  try {
    await fastify.listen({ port: 5000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()