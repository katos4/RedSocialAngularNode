'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'Proyecto_Red_Social_GregorioHarriero';

/**Servicio para crear y codificar el token del usuario con sus datos. */


/** Crear un objeto json con los datos del usuario que iran codificados en el token*/
//Como solo tengo una funcion, la exporto directamente
exports.createToken = function(user){
    //variable con los datos del usuario a codificar dentro del token
    var payload = {
        sub: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix()
    };

    /**Se genera y codifica el token con todos los datos del usuario registrado en este momento
     * y la clave secreta, esta es utilizada como llave maestra para codificarlo, este token irá 
     * en la cabecera en una variable llamada Authorization */
    return jwt.encode(payload, secret);

};