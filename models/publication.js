'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
/**Esquema del modelo Publication con todas las propiedades que se guardaran en la bd */
var PublicationSchema = Schema({
    text: String,
    file: String,
    created_at: String,
    user: { type: Schema.ObjectId, ref: 'User'},
});

module.exports = mongoose.model('Publication', PublicationSchema);