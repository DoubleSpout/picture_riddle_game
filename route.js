var ClientArray = require('./client_cl/route.js');
var MangerArray = require('./manger_cl/route.js');

module.exports = ClientArray.concat(MangerArray);
