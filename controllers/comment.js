'use strict'

/**Cargar librerias y dependencias. */

var mongoosePaginate = require('mongoose-pagination');


/**Cargar los modelos */
var User = require('../models/user');
var Follow = require('../models/follow');
var Publication = require('../models/publication');
var Comment = require('../models/comment');

function pruebaComentario(req, res){
    res.status(200).send({message:'Hola mundo desde el controlador de Comment'});
}

/** Guardar comentario de una publicacion */
function saveComment(req, res){
    var params = req.body;
    var comment = new Comment();
    //var like = new Like();
    
    comment.user = req.user.sub
    comment.publication = params.publication
    comment.text = params.text;


    comment.save((err, commentStored) => {
        if(err) return res.status(500).send({message: 'Error al guardar el comentario'});
        if(!commentStored) return res.status(404).send({message: 'El comentario no se ha guardado'});

        return res.status(200).send({comment:commentStored});
    });
}


/** Eliminar comentario de una publicación */
function deleteComment(req, res){
    //Id del usuario logueado en ese momento
    var userId = req.user.sub;
    //Id de la publicacion que vamos a quitar el like
    var commentId = req.params.id;

    Comment.find({'user':userId, '_id':commentId}).remove((err =>{
        if(err)  return res.status(500).send({message: 'Error al eliminar comentario'});

        return res.status(200).send({message:'El comentario se ha eliminado correctamente'});
    }))
}

function getComments(req, res){
    var publicationId = req.params.id;

    Comment.find({publication: publicationId}).populate('user', '_id name nick image').exec((err, comments) => {
        if(err) return res.status(500).send({message: 'Error en el servidor'});

        if(!comments) return res.status(404).send({message: 'No hay ningun comentario'});

        return res.status(200).send({comments});
    });
}


module.exports = {
    pruebaComentario,
    saveComment,
    deleteComment,
    getComments
}