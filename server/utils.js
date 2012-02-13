var Utils = {};

module.exports = Utils;

Utils.random = function(bitlength) {
  bitlength = bitlength ||128;
  if (bitlength > 32) {
    var parts  = Math.ceil(bitlength / 32),
    stringParts = '';
      
    while (parts--) stringParts += this.random(32);
    return stringParts;
  }

  var limit   = Math.pow(2, bitlength) - 1,
      maxSize = limit.toString(36).length,
      string  = Math.floor(Math.random() * limit).toString(36);
    
  while (string.length < maxSize) string = '0' + string;
  return string;
};