const express = require('express');
const routes = require('./controllers');
const path = require('path');
const sequelize = require('./config/connection');
// import handlebars
const exphbs = require('express-handlebars');
const hbs = exphbs.create({});



const app = express();
const PORT = process.env.PORT || 3001;

// handlebars
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// turn on routes
app.use(routes);

// turn on connection to b and server
sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => console.log(`Now listening ${PORT}`))
});