'use strict'

/**Archivo que se ejecuta cuando damos la instruccion npm start en la consola */

var mongoose = require('mongoose');

/**variable con toda la configuracion de express*/
var app = require('./app');
var port = 3800;
var port2 = 5000;
var server = require('http').Server(app);

const host = process.env.HOST || '0.0.0.0';
const puerto = process.env.PORT || 3800;

//importar variables de entorno local
require('dotenv').config({path: 'variables.env'});


/**Conexion a la base de datos*/
mongoose.Promise = global.Promise;
//mongoose.connect('mongodb://localhost:27017/social-network', {useMongoClient: true}, {useNewUrlParser: true})
mongoose.connect(process.env.DB_URL, {useMongoClient: true}, {useNewUrlParser: true})
    .then(()=>{
        console.log("La conexion a la base de datos social-network se ha realizado correctamente");

        /**crear servidor*/

        app.listen(puerto, host, () => {
            console.log("SERVIDOR FUNCIONANDO CORRECTAMENTE!!!");
        });
    })
    .catch(err => {console.log(err)});



