'use strict'

var express = require('express');
var MessageController = require('../controllers/message');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

/**Rutas pertenecientes a los mensajes. */
api.get('/probando-md', md_auth.ensureAuth, MessageController.probando);
api.post('/message', md_auth.ensureAuth, MessageController.saveMessage);
api.get('/my-messages/:page?', md_auth.ensureAuth, MessageController.getReceivedMessage);
api.get('/messages/:page?', md_auth.ensureAuth, MessageController.getEmitterMessages);
api.get('/unviewed-messages', md_auth.ensureAuth, MessageController.getUnviewedMessages);
api.get('/set-viewed-messages', md_auth.ensureAuth, MessageController.setViewedMessage);



module.exports = api;