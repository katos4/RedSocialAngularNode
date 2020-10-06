'use strict'

/**Archivo que se ejecuta cuando damos la instruccion npm start en la consola */

var mongoose = require('mongoose');

/**variable con toda la configuracion de express*/
var app = require('./app');

var port = 3800;

/**Conexion a la base de datos*/
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/social-network', {useMongoClient: true})
    .then(()=>{
        console.log("La conexion a la base de datos social-network se ha realizado correctamente");

        /**crear servidor*/
        app.listen(port, () => {
            console.log("Servidor corriendo correctamente en http://localhost:3800");
        });
    })
    .catch(err => {console.log(err)});



