var transport = {};

transport.XHR = function(data, endpoint, callback, retry, scope) {
  this.xhr = this._getXmlHttpObject();

  this.xhr.open('POST', endpoint, true);
  this.xhr.setRequestHeader('Content-Type', 'application/json');
  this.xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

  this.xhr.onreadystatechange = function() {
    if (this.readyState !== 4) return;

    var status = this.status;

    if ((status >= 200 && status < 300) || status === 304 || status === 1223) {
      callback.call(scope, "ok", this.responseText);
    }
    else {
      callback.call(scope, "error");
    }

    retry.call(scope);
  };

  this.xhr.send(data);
};

transport.XHR.prototype.isUsable = function(endpoint) {
  return true;
};

transport.XHR.prototype._getXmlHttpObject = function() {
  // Mozilla/Safari
  if (window.XMLHttpRequest) {
    return new XMLHttpRequest();
  }
  // IE
  else if (window.ActiveXObject) {
    return new ActiveXObject("Microsoft.XMLHTTP");
  }
};
