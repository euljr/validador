var v = require('validator');
var _sanitizers = ['blacklist', 'escape', 'unescape', 'ltrim',
    'normalizeEmail', 'rtrim', 'stripLow', 'toBoolean',
    'toDate', 'toFloat', 'toInt', 'trim', 'whitelist'];
var _msg = 'Validation error';
var _options = {};

var middleware = function (req, res, next) {
    req.validationErrors = null;
    req.validador = function (key, type, action, errorMessage) {
        if (key == null)
            throw new Error('Key cannot be empty');
        if (['body', 'query', 'params'].indexOf(type) === -1)
            throw new Error('Invalid type, must be body, query or params');
        if (typeof action !== 'string' && typeof action !== 'object')
            throw new Error('Action must be a string or array');
        var item = req[type][key];
        if (typeof item === 'undefined')
            return;
        if (!Array.isArray(action))
            action = [].push(action);
        action.every(function (a) {
            var e = run(item, a, errorMessage || _options.errorMessage || _msg);
            if (e == null)
                return true;
            if(req.validationErrors == null)
                req.validationErrors = {};
            req.validationErrors[key] = e;
            return false;
        });
    }
    next();
}

var run = function (key, action, errorMessage) {
    var msg = action.split('|')[1] || errorMessage;
    var func = action.split('|')[0].split(':')[0];
    var param = action.split('|')[0].split(':')[1] || undefined;
    console.log('tentando rodar: ' + func)
    if (v[func] != null) {
        if (_sanitizers.indexOf(func) !== -1)
            key = v[func](key, param);
        else {
            console.log(func);
            if (!v[func](key, param))
                return msg;
        }
    } else if (_options.customValidators[func] != null) {
        if (!_options.customValidators[func](key, param))
            return msg;
    } else if (_options.customSanitizers[func])
        _options.customSanitizers[func](key, param);
    return null;
}

var validador = function (options) {
    if (options != null)
        _options = options;
    if (!_options.hasOwnProperty('customValidators'))
        _options['customValidators'] = {};
    if (!_options.hasOwnProperty('customSanitizers'))
        _options['customSanitizers'] = {};
    return middleware;
}

module.exports = validador;