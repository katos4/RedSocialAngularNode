'use strict'

/**Cargar librerias y dependencias. */

var mongoosePaginate = require('mongoose-pagination');


/**Cargar los modelos */
var User = require('../models/user');
var Follow = require('../models/follow');
var Like = require('../models/like');

function pruebaLike(req, res){
    res.status(200).send({message:'Hola mundo desde el controlador de Like'});
}

/** Dar like a una publicación */
function saveLike(req, res){
    var params = req.body;
    var like = new Like();
    
    like.publication = params.publication
    like.user = req.user.sub

    like.save((err, likeStored) => {
        if(err) return res.status(500).send({message: 'Error al guardar el like'})
        
        if(!likeStored) return res.status(404).send({message: 'El like no se ha guardado'})
        
        return res.status(200).send({like:likeStored});
    });
}

/** Eliminar like de una publicación */
function deleteLike(req, res){
      //Id del usuario logueado en ese momento
      var userId = req.user.sub;
      //Id de la publicacion que vamos a quitar el like
      var publicationId = req.params.id;
  
      Like.find({'user':userId, 'publication':publicationId}).remove((err =>{
          if(err)  return res.status(500).send({message: 'Error al eliminar like'});
  
          return res.status(200).send({message:'El like se ha eliminado correctamente'});
      }))
}

function deleteAllLikes(req, res){
    var userId = req.user.sub;
    var publicationId = req.params.id;

    Like.deleteMany({'publication':publicationId}).remove((err =>{
        if(err)  return res.status(500).send({message: 'Error al eliminar comentario'});

        return res.status(200).send({message:'TODOS los likes se han eliminado correctamente'});
    }))
}

function getLikes(req, res){

    var userId = req.user.sub;

    //usuario que yo sigo
   /* var find = Follow.find({user: userId});

    if(req.params.followed){
        //usuarios que me estan siguiendo si recibo el parametro followed
        find = Follow.find({followed: userId});
    }*/

    Like.find({'user':userId}).exec((err, myLikes) => {
        if(err) return res.status(500).send({message: 'Error en el servidor'});

        if(!myLikes) return res.status(404).send({message: 'No has dado ningun like'});

        return res.status(200).send({myLikes});
    });
}


function countLikes(req, res){
    var publicationId = req.params.id;
    
    Like.find({'publication':publicationId}).count().exec((err, likes) => {
        if(err) return res.status(500).send({message: 'Error en el servidor'});

        if(!likes) return res.status(200).send({likes: 0});

        return res.status(200).send({likes});
    });
}

module.exports = {
    saveLike,
    pruebaLike,
    deleteLike,
    deleteAllLikes,
    getLikes,
    countLikes
}