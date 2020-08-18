const express = require('express');
const routes = require('./controllers');
const path = require('path');
const helpers = require('./utils/helpers');
// starts the express connection
const app = express();
const PORT = process.env.PORT || 3001;
const sequelize = require('./config/connection');
// import handlebars
const exphbs = require('express-handlebars');
// helpers runs the helpers in the handlebars (without it the helpers cant run)
const hbs = exphbs.create({ helpers });
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store)
// creates the session
const sess = {
    secret: 'Super secret secret',
    cookie: {},
    resave: false,
    saveUninitialized: true,
    store: new SequelizeStore({
        db: sequelize
    })
};

//uses the session
app.use(session(sess));



// middleware for express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// handlebars
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
// turn on routes
app.use(routes);

// turn on connection to b and server
sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => console.log(`Now listening ${PORT}`))
});