'use strict'
var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');

var User = require('../models/user');
var Follow = require('../models/follow');
var Publication = require('../models/publication');
var jwt = require('../services/jwt');
const user = require('../models/user');


const itemsPerPage = 100;

function home(req,res){
    res.status(200).send({
        message: 'Home del servidor NodeJs'
    });
}


function pruebas(req,res){
    res.status(200).send({
        message: 'Accion de pruebas en el servidor NodeJs'
    });
}

/**REGISTRO. */
function saveUser(req, res){
    var params = req.body;
    var user = new User();

    if(params.name && params.surname && params.nick && params.email && params.password){
        
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        //comprobar que no haya otro usuario con el mismo email o nick
        User.find({$or: [
            {email: user.email.toLowerCase()},
            {nick: user.nick.toLowerCase()}
        ]}).exec((err, users) =>{
            if(err) return res.status(500).send({message:'Error en la peticion de usuarios'});

            if(users && users.length >= 1){
               return res.status(200).send({message: 'El usuario que intenta registrar ya existe'});

            }else{
                //encriptacion de contraseña
                bcrypt.hash(params.password, null, null, (err, hash) =>{
                    user.password = hash;

                    //guardar el usuario en la bd
                    user.save((err, userStored) =>{
                        if(err) return res.status(500).send({message:'Error al guardar el usuario'});

                        if(userStored){
                            res.status(200).send({user: userStored});
                        }else{
                            res.status(404).send({message:'No se ha registrado el usuario'});
                        }
                    });
                });
            }
        });

    }else{
        res.status(200).send({message: 'Es necesario rellenar todos los datos'});
    }
}

/**LOGIN */
function loginUser(req, res){
    //recoger los datos que llega en el body de la peticion
    var params = req.body;

    var email = params.email;
    var password = params.password;

    //busco el usuario con el email recibido
    User.findOne({email: email}, (err, user) =>{
        if(err) return res.status(500).send({message:'Error en la petición'});

        //si encuentro el usuario, comparo la clave recibida con la existente en la bd
        if(user){
            bcrypt.compare(password, user.password, (err, check) =>{

                if(check){
                    //comprobamos si llega el token con los datos del usuario
                    if(params.gettoken){
                       //generar y devolver el token
                       return res.status(200).send({
                            token: jwt.createToken(user)
                       });
                    }else{
                        //si no llega el token, devolver datos de usuario, sin token
                        user.password = undefined;
                        return res.status(200).send({user});
                    }
                }else{
                    return res.status(404).send({message:'El usuario no se ha podido identificar'});
                }
            });
        }else{
            return res.status(404).send({message:'El usuario no se ha podido identificar!!'});
        }
    });

}

/**DATOS DE UN SOLO USUARIO */
function getUser(req, res){
    var userId = req.params.id;

    User.findById(userId, (err, user) =>{
        if(err) return res.status(500).send({message:'Error en la peticion'});
        
        if(!user) return res.status(404).send({message:'El usuario no existe'});

            followThisUser(req.user.sub, userId).then((value) =>{
                user.password = undefined;
                return res.status(200).send({
                    user,
                    following: value.following,
                    followed: value.followed
                });
            });
        });
}

/**Promesa para comprobar si al obtener un usuario, dicho usuario me sigue a mi o yo a el */
async function followThisUser(identity_user_id, user_id){
    try{

        var following = await Follow.find({'user':identity_user_id, 'followed': user_id}).exec()
        .then((follows) => {
            return follows
        }).catch((error) => {
            return handleError(error);
        });
        
      /*  var following = await Follow.findOne({'user':identity_user_id, 'followed': user_id}).exec((err, follow) =>{
            if(err) return handleError(err);
            return follow;
        });*/
    
        var followed = await Follow.find({'user':user_id, 'followed': identity_user_id}).exec()
        .then((follows) => {
            return follows
        }).catch((error) => {
            return handleError(error);
        });
        /*var followed = await (await Follow.findOne({'user': user_id, 'followed': identity_user_id})).exec((err, follow) =>{
            if(err) return handleError(err);
            return follow;
        });*/
    
        return {
            following: following,
            followed: followed
        }
    }catch(e){
        console.log(e);
    }
    
}

function getFriends(req, res){
    var user_id = req.params.id;

    User.find({'_id': user_id}, (err, users) => {
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(!users) return res.status(404).send({message: 'No hay usuarios disponibles'});

        return res.status(200).send({users});
    });
}


/**DEVOLVER TODOS LOS USUARIOS PAGINADOS */
function getUsers(req, res){
    //id del user logueado en este momento
    var identity_user_id = req.user.sub;

    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    //var itemsPerPage = 100;

    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) =>{
        if(err) return res.status(500).send({message:'Error en la peticion'});

        if(!users) return res.status(404).send({message:'No hay usuarios disponibles'});

        followUserId(identity_user_id).then((value) =>{
            return res.status(200).send({
                users,
                users_following: value.following,
                users_follow_me: value.followed,
                total,
                pages: Math.ceil(total/itemsPerPage)
            });
        });
    });
}

const followUserId = async (user_id) => {
   try{

        /*array con todos los ids de los usuarios que me estan siguiendo (campo followed en la bd) user_id es el usuario
        identificado en este momento, todos los demas valores se ponen a 0 para quitarlos de la respuesta*/

       // var following = await Follow.find({'user':user_id}).select({'_id':0,'__v':0,'user':0}).exec((err, follows) =>{return follows;});
        /**USUARIOS A LOS QUE SIGO */
       var following = await Follow.find({'user':user_id}).select({'_id':0,'__v':0,'user':0}).exec()
            .then((follows) => {
                return follows
            }).catch((error) => {
                return handleError(error);
            });
       
        //var followed = await Follow.find({'followed':user_id}).select({'_id':0,'__v':0,'followed':0}).exec((err, follows) =>{return follows;});
        /**USUARIOS QUE ME SIGUEN */
        var followed = await Follow.find({'followed':user_id}).select({'_id':0,'__v':0,'followed':0}).exec()
            .then((follows) => {
                return follows
            }).catch((error) => {
                return handleError(error);
            });

        if(following){
            //Procesar following ids
            var following_clean = [];
                
            following.forEach((follow)=>{
                following_clean.push(follow.followed)
            });
        }
        
        if(followed){
            //Procesar followed ids
            var followed_clean = [];
                
            followed.forEach((follow)=>{
                followed_clean.push(follow.user)
            });
        }
        

        return {
            following: following_clean,
            followed: followed_clean
        }
    }catch(e){
        console.log(e);
    }

}


/**Contadores de cuanta gente seguimos y cuanta gente nos siguen */
function getCounters(req, res){
    let userId = req.user.sub;

    //si se recibe el id por la url, la variable coge ese, si no, coge el que le llega por el body
    if(req.params.id){
       userId = req.params.id;
    }
    getCountFollow(userId).then((value) => {
        return res.status(200).send(value);
    }); 
}

/**Funcion asincrona para obtener el numero de seguidores y seguidos */
const getCountFollow = async (user_id) => {
    try{
        let following = await Follow.countDocuments({"user": user_id},(err, result) => { return result });
        let followed = await Follow.countDocuments({"followed": user_id}).then(count => count);
        let publications = await Publication.countDocuments({"user": user_id}, (err, resultado) =>{return resultado});
 
        return { following, followed, publications}
    } catch(e){
        console.log(e);
    }
}

/** EDITAR DATOS DE USUARIO*/
function updateUser(req, res){
    var userId = req.params.id;
    var update = req.body;

    //borrar propiedad password
    delete update.password;

    if(userId != req.user.sub){
        return res.status(500).send({message:'No tienes permiso para actualizar los datos'});
    }

    //Evitar duplicidad de datos a la hora de actualizar evitando que no se actualice a algo que ya exista
    User.find({$or:[
        {email: update.email.toLowerCase()},
        {nick: update.nick.toLowerCase()}
    ]}).exec((err, users) => {

        var user_isset = false;
        users.forEach((user) =>{
            if(user && user._id != userId) user_isset = true;
        });
        if(user_isset) return res.status(404).send({message:'No tienes permiso para actualizar los datos del usuario'});

        //Actualizar el usuario con los datos recibidos del frontend
        User.findByIdAndUpdate(userId, update, {new:true}, (err, userUpdated) => {
            if(err) return res.status(500).send({message:'Error en la peticion'});
    
            if(!userUpdated) return res.status(404).send({message:'No se ha podido actualizar el usuario'});
    
            return res.status(200).send({user: userUpdated});
        });

    });
    
   
}

/** SUBIR ARCHIVOS DE IMAGEN / AVATAR DEL USUARIO*/
function uploadImage(req,res){
    var userId = req.params.id;

    if(req.files){
        /**Ruta de la imagen */
        var filePath = req.files.image.path;
        /**Corto la ruta para quedarme solo con el nombre de la imagen */
        var fileSplit = filePath.split('\\');
        var fileName = fileSplit[2];
     /**Corto el nombre de la imagen para quedarme solo con la extension */
        var extensionSplit = fileName.split('\.');
        var fileExtension = extensionSplit[1];

        if(userId != req.user.sub){
           return removeFilesOfUploads(res, filePath, 'No tienes permiso para actualizar los datos');
           
        }
        /**Compruebo que la extension de la imagen es correcta */
        if(fileExtension == 'png' || fileExtension == 'jpg' || fileExtension == 'jpeg' || fileExtension == 'gif'){

            /**actualizar datos de usuario */
            User.findByIdAndUpdate(userId, {image: fileName}, {new: true}, (err, userUpdated ) => {
                if(err) return res.status(500).send({message:'Error en la peticion'});

                if(!userUpdated) return res.status(404).send({message:'No se ha podido actualizar la imagen'});

                return res.status(200).send({user: userUpdated});
            });
        }else{
            /**si la extension no es correcta, se elimina directamente el fichero */
           return removeFilesOfUploads(res, filePath, 'Extension no valida');
        }
    }else{
        return res.status(200).send({message: 'No se han subido archivos'});
    }
}

/**Elimina los archivos subidos si la extension no es valida */
function removeFilesOfUploads(res, filePath, message){

    fs.unlink(filePath, (err) =>{
        return res.status(200).send({message: message});
    });
}


/**DEVOLVER IMAGEN DEL USUARIO */
function getImageFile(req, res){
    var imageFile = req.params.imageFile;
    var pathFile = './uploads/users/'+imageFile;

    fs.exists(pathFile, (exists) =>{
        if(exists){
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(200).send({message:'No existe ese fichero'});
        }
    })
}


/**Contador de publicaciones */



module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getFriends,
    getUsers,
    getCounters,
    updateUser,
    uploadImage,
    getImageFile
    
}