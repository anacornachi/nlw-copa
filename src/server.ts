import Fastify from 'fastify';
import cors from '@fastify/cors';
import {PrismaClient} from '@prisma/client';
import z from 'zod';
import ShortUniqueId from 'short-unique-id';

const prisma = new PrismaClient({
  log: ['query'],
});

async function bootstrap() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(cors, {
    origin: true,
  });

  fastify.get('/pools/count', async (req, res) => {
    const count = await prisma.pool.count();

    return {count};
  });

  fastify.post('/pools', async (req, res) => {
    const createPoolBody = z.object({
      title: z.string(),
    });

    const generate = new ShortUniqueId({length: 6});
    const code = String(generate()).toUpperCase();

    const {title} = createPoolBody.parse(req.body);

    await prisma.pool.create({
      data: {
        title,
        code,
      },
    });

    res.status(201).send({code});
  });

  fastify.get('/users/count', async (req, res) => {
    const count = await prisma.user.count();

    return {count};
  });

  fastify.get('/guesses/count', async (req, res) => {
    const count = await prisma.guess.count();

    return {count};
  });

  await fastify.listen({port: 3333, host: '0.0.0.0'});
}

bootstrap();
