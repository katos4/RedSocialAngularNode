'use strict'

/**Cargar librerias. */
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');


/** Cargar modelos*/
var User = require('../models/user');
var Follow = require('../models/follow');
var Message = require('../models/message');

function probando(req, res){
    return res.status(200).send({message: 'Probando desde el controlador de mensajes'});
}

/**Enviar mensaje */
function saveMessage(req, res){
    var params = req.body;

    if(!params.text || !params.receiver) return res.status(200).send({message: 'Envia los datos necesarios'});

    var message = new Message();
    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewed = 'false';

    message.save((err, messageStored) => {
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(!messageStored) return res.status(500).send({message: 'Error al enviar el mensaje'});
    
        return res.status(200).send({message: messageStored});
    });
    
}


function getAllMessagesEmitted(req, res){
    var emitter = req.user.sub;
    var receiver = req.params.id;

    Message.find({emitter: emitter, receiver: receiver}).populate('receiver', 'nick').exec((err, messages) => {
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(!messages) return res.status(404).send({message: 'No hay mensajes'});

        return res.status(200).send({
            messages
        });
    }); 
}

function getAllMessagesReceived(req, res){
    var emitter = req.user.sub;
    var receiver = req.params.id;

    Message.find({emitter: receiver, receiver: emitter}).populate('receiver', 'nick').exec((err, messages) => {
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(!messages) return res.status(404).send({message: 'No hay mensajes'});

        return res.status(200).send({
            messages
        });
    }); 
}


/**Obtener un solo mensaje */

function getSingleMessage(req, res){
    var messageId = req.params.id;

    Message.find({'_id': messageId}).populate('emitter receiver', 'name surname nick image _id').exec((err, message) => {
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(!message) return res.status(404).send({message: 'No existe ese mensaje'});

        return res.status(200).send({
            message
        });
    });
}

/**Listar los mensajes recibidos */
function getReceivedMessage(req, res){
    var userId = req.user.sub;

    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 7;

    Message.find({receiver: userId}).populate('emitter', 'name surname nick image _id').sort({'created_at':-1}).paginate(page, itemsPerPage, (err, messages, total) => {
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(!messages) return res.status(404).send({message: 'No hay mensajes'});
    
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages
        });
    
    });
}

/**Listar los mensajes enviados */
function getEmitterMessages(req, res){
    var userId = req.user.sub;

    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 7;

    Message.find({emitter: userId}).populate('emitter receiver', 'name surname nick image _id').sort({'created_at':-1}).paginate(page, itemsPerPage, (err, messages, total) => {
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(!messages) return res.status(404).send({message: 'No hay mensajes'});
    
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages
        });
    
    });
}


/**Contar mensajes sin leer */
function getUnviewedMessages(req, res){
    var userId = req.user.sub;

    Message.count({receiver:userId, viewed:'false'}).exec((err, count) => {
        if(err) return res.status(500).send({message:'Error en la peticion'});
        return res.status(200).send({
            'unviewed':count
        });
    });
}

/**Marcar mensaje como leido */
function setViewedMessage(req, res){
    var userId = req.user.sub;

    Message.update({receiver:userId, viewed:'false'}, {viewed:'true'}, {'multi':true}, (err, messageUpdated) => {
        if(err) return res.status(500).send({message:'Error en la peticion'});
        return res.status(200).send({messages: messageUpdated});
    });
}

function deleteMessage(req, res){
    var messageId = req.params.id;
    
    Message.find({'_id': messageId}).remove((err =>{
        if(err)  return res.status(500).send({message: 'Error al borrar el mensaje'});

        return res.status(200).send({message:'El mensaje se ha eliminado correctamente'});
    }))
}

module.exports = {
    probando,
    saveMessage,
    getAllMessagesEmitted,
    getAllMessagesReceived,
    getSingleMessage,
    getReceivedMessage,
    getEmitterMessages,
    getUnviewedMessages,
    setViewedMessage,
    deleteMessage
}