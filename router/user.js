'use strict'

var express = require('express');
var UserController = require('../controllers/user');

/**Librerias necesarias */
var api = express.Router();
var middleAuth = require('../middlewares/authenticated');
var multipart = require('connect-multiparty');
var middleUpload = multipart({uploadDir: './uploads/users'});

/**Rutas pertenecientes a los usuarios */

api.get('/home', UserController.home);
api.get('/pruebas',/* middleAuth.ensureAuth,*/ UserController.pruebas);
api.post('/register', UserController.saveUser);
api.post('/login', middleAuth.ensureAuth, UserController.loginUser);
api.get('/user/:id', /*middleAuth.ensureAuth,*/ UserController.getUser);
api.get('/users/:page?', /*middleAuth.ensureAuth,*/ UserController.getUsers);
api.get('/counters/:id?', middleAuth.ensureAuth, UserController.getCounters);
api.put('update-user/:id',/* middleAuth.ensureAuth,*/ UserController.updateUser);
api.post('/upload-image-user/:id',[/*middleAuth.ensureAuth,*/ middleUpload], UserController.uploadImage);
api.get('/get-image-user/:imageFile', UserController.getImageFile);


module.exports = api;