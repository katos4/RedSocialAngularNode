'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
/**Esquema del modelo Message con todas las propiedades que se guardaran en la bd */
var MessageSchema = Schema({
    text: String,
    viewed: String,
    created_at: String,
    emitter: { type: Schema.ObjectId, ref:'User'},
    receiver: { type: Schema.ObjectId, ref:'User'},
});

module.exports = mongoose.model('Message', MessageSchema);