import Fastify from 'fastify';
import cors from '@fastify/cors';
import {pollRoutes} from './routes/poll';
import {guessRoutes} from './routes/guess';
import {authRoutes} from './routes/auth';
import {gameRoutes} from './routes/game';
import {userRoutes} from './routes/user';
import jwt from '@fastify/jwt';

async function bootstrap() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(cors, {
    origin: true,
  });

  await fastify.register(jwt, {
    secret: ' $sda7@!^NDysgda',
  });

  fastify.register(authRoutes);
  fastify.register(gameRoutes);
  fastify.register(guessRoutes);
  fastify.register(pollRoutes);
  fastify.register(userRoutes);

  await fastify.listen({port: 3333, host: '0.0.0.0'});
}

bootstrap();
