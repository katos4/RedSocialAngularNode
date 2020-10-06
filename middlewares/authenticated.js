'use strict'
/**Archivo middleware de autenticacion, para saber si el usuario que está
 *  interactuando ahora está logueado en nuestra red, este archivo se ejecuta en todas las rutas
 * que lo requieran antes de llegar al metodo del controlador correspondiente */


var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'Proyecto_Red_Social_GregorioHarriero';


/**  como es una sola funcion la exporto directamente, recibe 3 parametros:
req = datos que recibimos
res = respuesta que damos
next = funcionalidad que nos permite saltar a otra cosa, es decir, hasta que no se lance 
        el metodo next, no se sale del middleware y ejecuta lo siguiente*/

exports.ensureAuth = function(req, res, next){
    /**el token nos debe llegar en una cabecera que se llama authorization*/
    if(!req.headers.authorization){
        return res.status(403).send({message: 'La peticion no tiene la cabecera de autenticacion'});
    }

    /** guardamos el token en una variable reemplazando todas las comillas simples y dobles*/
    /**asi nos quedamos con el token limpio*/
    var token = req.headers.authorization.replace(/['"]+/g,'');

    try{
        /**Decodificamos el token que nos ha llegado */
        var payload = jwt.decode(token, secret);

        if(payload.exp <= moment().unix()){
            return res.status(401).send({message:'El token ha expirado'});
        }
    }catch(ex){
        return res.status(404).send({message:'El token no es valido'});
    }
    
    req.user = payload;

    /**Una vez que se ha hecho y verificado todo en este middleware se pasa al siguiente punto y se continua
     * con la ejecucion del programa, en este caso se pasa a los metodos de los diferentes controladores.
     */
    next();
}