import app from './lib/app.js';
import pool from './sql/pool.js';

const PORT = process.env.PORT || 7890;

app.listen(PORT, async () => {
  console.info(`🚀  Server started on port ${PORT}`);
});

process.on('exit', () => {
  console.info('👋  Goodbye!');
  pool.end();
});
