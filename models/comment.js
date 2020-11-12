'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**Esquema del modelo Comment con todas las propiedades que se guardaran en la bd. */
var CommentSchema = Schema({
    text: String,
    publication: {type: Schema.ObjectId, ref:'Publication'},
    user: { type: Schema.ObjectId, ref:'User' },
    created_at: String
});

module.exports = mongoose.model('Comment', CommentSchema);