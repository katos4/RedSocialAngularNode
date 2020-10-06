'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**Esquema del modelo Follow con todas las propiedades que se guardaran en la bd. */
var FollowSchema = Schema({
    user: { type: Schema.ObjectId, ref:'User' },
    followed: { type: Schema.ObjectId, ref:'User'}
});

module.exports = mongoose.model('Follow', FollowSchema);