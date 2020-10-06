'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**Esquema del modelo User con todas las propiedades que se guardaran en la bd */
var UserSchema = Schema({
    name: String,
    surname: String,
    nick: String,
    email: String,
    password: String,
    role: String,
    image: String,
});


module.exports = mongoose.model('User', UserSchema);