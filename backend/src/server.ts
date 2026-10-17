import 'dotenv/config';
import app from './app.js';
import { ADMIN_KEY } from './middleware/auth.middleware.js';

const PORT = Number(process.env.PORT) || 4173;

app.listen(PORT, () => {
  console.log(`Crafts of Cashmere backend running at http://localhost:${PORT}`);
  console.log(
    `Admin key: ${ADMIN_KEY === 'cashmere-admin' ? 'cashmere-admin (default — override with ADMIN_KEY env)' : 'configured from ADMIN_KEY env'}`
  );
});
