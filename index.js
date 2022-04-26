const express = require("express");
const app = express();
const port = 3001;
const routes = require('./routes');

app.use(express.json());

app.use('/info',routes);

app.listen(port, () => {
    console.log(`Server is running on ${port}`)
})