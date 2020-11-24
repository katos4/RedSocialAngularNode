'use strict'

var express = require('express');
//var FollowController = require('../controllers/follow');
var LikeController = require('../controllers/like');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

/**Rutas pertenecientes a la seccion follow. */

//api.get('/prueba-follow', FollowController.prueba);
api.get('/prueba-like', md_auth.ensureAuth, LikeController.pruebaLike);
api.post('/like', md_auth.ensureAuth, LikeController.saveLike);
api.delete('/like/:id', md_auth.ensureAuth, LikeController.deleteLike);
api.delete('/like-all/:id', md_auth.ensureAuth, LikeController.deleteAllLikes);
api.get('/get-my-likes', md_auth.ensureAuth, LikeController.getLikes);
api.get('/count-likes/:id', md_auth.ensureAuth, LikeController.countLikes);


module.exports = api;