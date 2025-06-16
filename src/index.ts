import Fastify from 'fastify';
import { loadData } from '../scripts/loadData'

const fastify = Fastify({ logger: true });

fastify.get('/', async (request, reply) => {
    return { hello: 'world' };
});

const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        console.log('Server is running at http://localhost:3000');
        // Ejecutar solo en desarrollo
        if (process.env.NODE_ENV !== 'production') {
            await loadData()
        }
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();