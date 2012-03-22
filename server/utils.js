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

Utils.waitForPostData = function(request, callback) {
  var _content = '';

  request.addListener('data', function(chunk) {
    _content += chunk;
  });

  request.addListener('end', function() {
    callback(_content);
  });
};

Utils.strip_tags = function(input, allowed) {
    allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
};