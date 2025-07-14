// test/compose-stream-test-server.ts
import express from 'express';
import * as compose from './utils/docker/compose.js';

const app = express();
const PORT = 3001;

app.get('/status/stream', (req, res) => {
	res.set({
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		Connection: 'keep-alive'
	});
	res.flushHeaders();

	const sendStatus = async () => {
		try {
			const status = await compose.getStatus();

			res.write(`data: ${JSON.stringify(status)}\n\n`);
		} catch (err: any) {
			res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
		}
	};

	const interval = setInterval( sendStatus, 3000 );
	sendStatus();

	req.on('close', () => {
		clearInterval(interval);
		console.log('🔌 Client disconnected');
	});
});

app.listen(PORT, () => {
	console.log(`🧪 Compose status test server at http://localhost:${PORT}/status/stream`);
});
