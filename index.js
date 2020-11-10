'use strict'

/**Archivo que se ejecuta cuando damos la instruccion npm start en la consola */

var mongoose = require('mongoose');

/**variable con toda la configuracion de express*/
var app = require('./app');
var port = 3800;
var port2 = 5000;
var server = require('http').Server(app);

//servidor de websocket
var io = require('socket.io')(server);

var myMessages = [];
var disconnectedUsers = [];
var connectedUsers = [];

io.on('connection', (socket) => {
    console.log("ALGUIEN SE HA CONECTADOo CON SOCKETS");
    console.log("EL ID DEL SOCKET ES "+socket.id);
   
    //escuchar el mensaje del cliente
    socket.on('send-message', (data) => {
        myMessages.push(data);
        socket.emit('text-event',myMessages);
        
        socket.broadcast.emit('text-event',myMessages);
    });

    socket.on('get-friends', (data) => {
        
        disconnectedUsers.push(data);
        socket.broadcast.emit('all-users',disconnectedUsers);
        
        
    });

    socket.on('new-user', (data, callback) => {

    });

  

    //ver cuando un usuario se ha desconectado
    socket.on('disconnect', () => {
        console.log("UN USUARIO SE HA DESCONECTADO");
    });
});



/**Conexion a la base de datos*/
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/social-network', {useMongoClient: true}, {useNewUrlParser: true})
    .then(()=>{
        console.log("La conexion a la base de datos social-network se ha realizado correctamente");

        /**crear servidor*/

        app.listen(port, () => {
            console.log("Servidor corriendo correctamente en http://localhost:3800");
        });

        server.listen(port2, () =>{
            console.log("Socket corriendo correctamente en http://localhost:5000"); 
        });
    })
    .catch(err => {console.log(err)});



