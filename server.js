require('dotenv').config();
const cors = require('cors');


const express = require('express');
const moongose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const tripRoutes = require('./routes/tripRoutes');
const documentRoutes = require('./routes/documentRoutes');
const dayRoutes = require('./routes/dayRoutes');
const activityRoutes = require('./routes/activityRoutes');
const commentRoutes = require('./routes/commentRoutes');

// express app
const app = express();

// midlewares
app.use(cors()); // Activamos CORS para cualquier origen
app.use(express.json());
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

// routes
app.use('/api/user', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/days', dayRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/comments', commentRoutes);

// connect to db
moongose.connect(process.env.MONGO_URI)
.then(() => {
    // listen for request
    app.listen(process.env.PORT, () => console.log('connected to db & listening on PORT:', process.env.PORT));
})
.catch((error) => {
    console.log('mongo:', process.env.MONGO_URI);
    console.log(error);
});