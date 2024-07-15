require('dotenv').config();

const express = require('express');
const moongose = require('mongoose');

// express app
const app = express();

// midlewares

// routes

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