'use strict';
 
const mongoose = require('mongoose'); 
const extend = require('mongoose-schema-extend');
var base = require('./base');
 
const Customer = base.extend({
  name: { type: String, default: '' },
  surname: { type: String, default: '' },
  province: { type: String, default: '' },
  district: { type: String, default: '' }, 
  neigbourhood: { type: String, default: '' } 
});
  
 
mongoose.model('Customer', Customer);