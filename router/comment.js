'use strict'

var express = require('express');
//var FollowController = require('../controllers/follow');
var CommentController = require('../controllers/comment');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

/**Rutas pertenecientes a la seccion comentarios. */


api.get('/prueba-comment', md_auth.ensureAuth, CommentController.pruebaComentario);
api.post('/comment', md_auth.ensureAuth, CommentController.saveComment);
api.delete('/comment/:id', md_auth.ensureAuth, CommentController.deleteComment);
api.get('/get-comments/:id', md_auth.ensureAuth, CommentController.getComments);


module.exports = api;