'use strict'

/**Cargar librerias y dependencias */
var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

/**Cargar modelos */
var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');


function probando(req, res){
    res.status(200).send({message:'Probando desde controlador de publicaciones'});

}

/**Guardar publicaciones nuevas */
function savePublication(req, res){
    var params = req.body;

    if(!params.text) return res.status(200).send({message:'Debes enviar un texto'});

    var publication = new Publication();
    
    publication.text = params.text;
    publication.file = null;
    publication.user = req.user.sub;
    publication.created_at = moment().unix();

    publication.save((err, publicationStored) => {
        if(err) res.status(500).send({message:'Error al guardar la publicacion'});
        
        if(!publicationStored) res.status(404).send({message:'La publicacion no ha sido guardada'})
        
        return res.status(200).send({publication: publicationStored});
    });

}

/**Obtener publicaciones de los usuarios a los que estoy siguiendo */
function getPublications(req, res){
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 4;

    /**Buscar todos los usuarios a los que seguimos */
    Follow.find({user: req.user.sub}).populate('followed').exec((err, follows) => {
        if(err) res.status(500).send({message:'Error al devolver el seguimiento'});
    
        var follows_clean = [];
        /**meter en un array todos los ids de los usuarios que seguimos */
        follows.forEach((follow) =>{
            follows_clean.push(follow.followed);
        });

        /**Buscar las publicaciones cuyo id coincida con alguno de dentro del array anterior */
        Publication.find({user: {"$in": follows_clean}}).sort('-created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) =>{
            if(err) res.status(500).send({message:'Error al devolver publicaciones'});
        
            if(!publications) res.status(404).send({message:'No hay publicaciones'});
        
            return res.status(200).send({
                total_items: total,
                pages: Math.ceil(total/itemsPerPage),
                page: page,
                publications
            });
        });

    });
}

/**Obtener una sola publicacion segun su id */
function getPublication(req, res){
    var publicationId = req.params.id;

    Publication.findById(publicationId, (err, publication) => {
        if(err) res.status(500).send({message: 'Error al devolver publicacion'});

        if(!publication) res.status(404).send({message:'No existe la publicacion'});

        return res.status(200).send({publication})

    });
}

/**Eliminar una publicacion0 */
function deletePublication(req, res){
    var publicationId = req.params.id;

    Publication.find({'user': req.user.sub, '_id':publicationId}).remove(err => {
        if(err) res.status(500).send({message: 'Error al borrar publicacion'});

        if(!publicationRemoved) res.status(404).send({message:'No se ha borrado la publicacion'});
    
        return res.status(200).send({message: 'Publicacion eliminada correctamente'});
    });
}

/**Subir imagenes a las publicaciones */
function uploadImage(req,res){
    var publicationId = req.params.id;

    if(req.files){
        /**Ruta de la imagen */
        var filePath = req.files.image.path;
        /**Corto la ruta para quedarme solo con el nombre de la imagen */
        var fileSplit = filePath.split('\\');
        var fileName = fileSplit[2];
        /**Corto el nombre de la imagen para quedarme solo con la extension */
        var extensionSplit = fileName.split('\.');
        var fileExtension = extensionSplit[1];

        /**Compruebo que la extension de la imagen es correcta */
        if(fileExtension == 'png' || fileExtension == 'jpg' || fileExtension == 'jpeg' || fileExtension == 'gif'){

            /**Comprobar si el usuario que actualiza la imagen es el usuario registrado */
            Publication.findOne({'user':req.user.sub, '_id':publicationId}).exec((err, publication) =>{
                if(publication){
                    /**Actualizar el documento de la publicacion*/
                    Publication.findByIdAndUpdate(publicationId, {file: fileName}, {new: true}, (err, publicationUpdated ) => {
                        if(err) return res.status(500).send({message:'Error en la peticion'});
        
                        if(!publicationUpdated) return res.status(404).send({message:'No se ha podido actualizar la imagen'});
        
                        return res.status(200).send({publication: publicationUpdated});
                    });
                }else{
                    return removeFilesOfUploads(res, filePath, 'No tienes permiso para actualiar esta publicacion');
                }
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
    var pathFile = './uploads/publications'+imageFile;

    fs.exists(pathFile, (exists) =>{
        if(exists){
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(200).send({message:'No existe ese fichero'});
        }
    })
}



module.exports = {
    probando,
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile
}