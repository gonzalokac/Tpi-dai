const express = require('express');
const app = express();
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');

app.use(express.json());

app.use(eventRoutes);
app.use(userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));

const eventLocationRoutes = require('./routes/eventLocation.routes');
app.use('/api/event-location', eventLocationRoutes);
