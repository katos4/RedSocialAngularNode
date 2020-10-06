'use strict'

/**Este es el fichero de rutas general de NodeJs */

/**Cargar librerias necesarias */
var express = require('express');
var bodyParser = require('body-parser');

/**instancia de express*/
var app = express();

/**cargar rutas desde los diferentes archivos de rutas para cada parte del backend*/
var user_routes = require('./router/user');
var follow_routes = require('./router/follow');
var publication_routes = require('./router/publication');
var message_routes = require('./router/message');

//const api = require('./router/user');


/**middlewares (metodos que se ejecutan antes de llegar a un controlador)*/
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json()); 

/**cors*/
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
 
    next();
});


/** Usar las rutas cargadas previamente*/
app.use('/api', user_routes);
app.use('/api', follow_routes);
app.use('/api', publication_routes);
app.use('/api', message_routes);

/**exportar configuracion*/
module.exports = app;