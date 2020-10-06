'use strict'

/**Cargar librerias y dependencias. */

var mongoosePaginate = require('mongoose-pagination');


/**Cargar los modelos */
var User = require('../models/user');
var Follow = require('../models/follow');

/*function prueba(req, res){
    res.status(200).send({message:'Hola mundo desde el controlador de Follow'});
}*/

/**Seguir a un usuario */
function saveFollow(req, res){
    var params = req.body;
    var follow = new Follow();
    
    follow.user = req.user.sub;
    follow.followed = params.followed;

    follow.save((err, followStored) => {
        if(err) return res.status(500).send({message: 'Error al guardar el seguimiento'})
        
        if(!followStored) return res.status(404).send({message: 'El seguimiento no se ha guardado'})
        
        return res.status(200).send({follow:followStored});
    });
}

/**Eliminar un seguimiento */
function deleteFollow(req, res){
    //Id del usuario logueado en ese momento
    var userId = req.user.sub;
    //Id del usuario al que vamos a dejar de seguir
    var followId = req.params.id;

    Follow.find({'user':userId, 'followed':followId}).remove((err =>{
        if(err)  return res.status(500).send({message: 'Error al dejar de seguir'});

        return res.status(200).send({message:'El follow se ha eliminado correctamente'});
    }))

}

/**Obtener todos los usuarios seguidos de un usuario */
function getFollowingUsers(req, res){
    //Id del user logueado en este momento
    var userId = req.user.sub;
    
    if(req.params.id){
        userId = req.params.id;
    }

    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Follow.find({user:userId}).populate({path:'followed'}).paginate(page, itemsPerPage, (err, follows, total) =>{
        if(err) return res.status(500).send({message: 'Error en el servidor'});

        if(!follows) return res.status(404).send({message: 'No estas siguiendo a ningun usuario'});

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            follows
        });
    });
}

/**Obtener todos los usuarios que me siguen */
function getFollowedUsers(req, res){
    var userId = req.user.sub;

    if(req.params.id){
        userId = req.params.id;
    }

    var page = 1;

    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Follow.find({followed:userId}).populate({path:'user'}).paginate(page, itemsPerPage, (err, follows, total) =>{
        if(err) return res.status(500).send({message: 'Error en el servidor'});

        if(!follows) return res.status(404).send({message: 'No estas te sigue ningun usuario'});

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            follows
        });
    });
}

/**Obtener los usuarios que sigo y me siguen sin paginar */
function getMyFollows(req, res){

    var userId = req.user.sub;

    //usuario que yo sigo
    var find = Follow.find({user: userId});

    if(req.params.followed){
        //usuarios que me estan siguiendo si recibo el parametro followed
        find = Follow.find({followed: userId});
    }
    
    find.populate('user followed').exec((err, follows) =>{
        if(err) return res.status(500).send({message: 'Error en el servidor'});

        if(!follows) return res.status(404).send({message: 'No sigues a ningun usuario'});

        return res.status(200).send({follows});
    });
}


module.exports = {
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getMyFollows
}