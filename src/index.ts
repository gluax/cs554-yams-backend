// Environment files
require('dotenv').config();

import app from './server';
import initSockets from './sockets/';

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
   console.log('YAMS Server on:', PORT);
});

initSockets(server);
