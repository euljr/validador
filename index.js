var v = require('validator');
var _sanitizers = ['blacklist', 'escape', 'unescape', 'ltrim',
    'normalizeEmail', 'rtrim', 'stripLow', 'toBoolean',
    'toDate', 'toFloat', 'toInt', 'trim', 'whitelist'];
var _msg = 'Validation error';
var _options = {};

var middleware = function (req, res, next) {
    req.validationErrors = {};
    req.validador = function (key, type, action, errorMessage) {
        if (key == null)
            throw new Error('Key cannot be empty');
        if (['body', 'query', 'params'].indexOf(type) === -1)
            throw new Error('Invalid type, must be body, query or params');
        if (typeof action !== 'string' || typeof action !== 'object')
            throw new Error('Action must be a string or array');
        var item = req[type][key];
        if (typeof item === 'undefined')
            return;
        if (!Array.isArray(action))
            action = [].push(action);
        action.every(function (a) {
            var e = run(item, a, errorMessage || _options.errorMessage || _msg);
            if(e == null)
                return true;
            req.validationErrors[key].msg = e;
            return false;
        });
    }
}

var run = function (errors, key, action, errorMessage) {
    var msg = action.split('|')[1] || errorMessage;
    var func = action.split('|')[0].split(':')[0];
    var param = action.split('|')[0].split(':')[1] || null;

    if (v[func] != null) {
        if (_sanitizers.indexOf(func) !== -1)
            key = v[func](key, param);
        else {
            if (!v[func](key, param))
                return msg;
        }
    }
    return null;
}

var validador = function (options) {
    if (options != null)
        _options = options;
    return middleware;
}

module.exports = validador;