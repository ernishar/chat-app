// app.js (or index.js)
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
// Import other route files

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/api', userRoutes);
// Use other route files

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log('listening on port ' + port);
});
