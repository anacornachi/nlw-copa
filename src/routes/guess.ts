import {FastifyInstance} from 'fastify';
import {z} from 'zod';
import {prisma} from '../lib/prisma';
import {authenticate} from '../plugins/authenticate';

export async function guessRoutes(fastify: FastifyInstance) {
  fastify.get('/guesses/count', async (req, res) => {
    const count = await prisma.guess.count();

    return {count};
  });

  fastify.post(
    '/polls/:pollId/games/:gameId/guesses',
    {
      onRequest: [authenticate],
    },
    async (req, res) => {
      const createGuessParams = z.object({
        pollId: z.string(),
        gameId: z.string(),
      });

      const createGuessBody = z.object({
        firstTeamPoints: z.number(),
        secondTeamPoints: z.number(),
      });

      const {pollId, gameId} = createGuessParams.parse(req.params);
      const {firstTeamPoints, secondTeamPoints} = createGuessBody.parse(
        req.body
      );

      const participant = await prisma.participant.findUnique({
        where: {
          userId_pollId: {
            userId: req.user.sub,
            pollId,
          },
        },
      });

      if (!participant) {
        return res.status(400).send({
          message: 'You are not allowed to create a guess inside this poll',
        });
      }

      const guess = await prisma.guess.findUnique({
        where: {
          gameId_participantId: {
            participantId: participant.id,
            gameId,
          },
        },
      });

      if (guess) {
        return res.status(400).send({
          message: 'You already sent a guess a guess for this poll',
        });
      }

      const game = await prisma.game.findUnique({
        where: {
          id: gameId,
        },
      });

      if (!game) {
        return res.status(400).send({
          message: 'Game not found',
        });
      }

      if (game.date < new Date()) {
        return res.status(400).send({
          message: 'Game already started',
        });
      }

      await prisma.guess.create({
        data: {
          gameId,
          participantId: participant.id,
          firstTeamPoints,
          secondTeamPoints,
        },
      });

      return res.status(201).send();
    }
  );
}
