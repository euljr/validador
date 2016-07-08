var v = require('validator');
var _sanitizers = ['blacklist', 'escape', 'unescape', 'ltrim',
    'normalizeEmail', 'rtrim', 'stripLow', 'toBoolean',
    'toDate', 'toFloat', 'toInt', 'trim', 'whitelist'
];
var _msg = 'Validation error';
var _options = {};

var middleware = function(req, res, next) {
    req.validationErrors = null;
    req.validador = function(key, type, action, errorMessage) {
        if (key == null)
            throw new Error('Key cannot be empty');
        if (['body', 'query', 'params'].indexOf(type) === -1)
            throw new Error('Invalid type, must be body, query or params');
        if (typeof action !== 'string' && typeof action !== 'object')
            throw new Error('Action must be a string or array');
        var item = req[type][key];
        var isUndefined = typeof item === 'undefined';
        if (!Array.isArray(action))
            action = [action];
        action.every(function(a) {
            var e = run(item, a, errorMessage || _options.errorMessage || _msg, isUndefined);
            if (e == null)
                return true;
            if (req.validationErrors == null)
                req.validationErrors = {};
            req.validationErrors[key] = e;
            return false;
        });
    }
    next();
}

var run = function(key, action, errorMessage, isUndefined) {
    var msg, func, param;
    if (typeof action === 'object') {
        if (!action.hasOwnProperty('func') || typeof action.func !== 'string')
            throw new Error('Wrong validation.');
        else
            func = action.func;
        param = action.param || undefined;
        msg = action.msg || errorMessage;
    } else {
        msg = action.split('|')[1] || errorMessage;
        func = action.split('|')[0].split(':')[0];
        param = action.split('|')[0].split(':')[1] || undefined;
    }
    if (func == 'required')
        return (isUndefined || v['isNull'](key)) ? msg : null;
    if (isUndefined)
        return null;

    if (v[func] != null) {
        if (_sanitizers.indexOf(func) !== -1)
            key = v[func](key, param);
        else {
            if (!v[func](key, param))
                return msg;
        }
    } else if (_options.customValidators[func] != null) {
        if (!_options.customValidators[func](key, param))
            return msg;
    } else if (_options.customSanitizers[func])
        key = _options.customSanitizers[func](key, param);
    else
        throw new Error('Validator or sanitizer ' + func + ' not found.');
    return null;
}

var validador = function(options) {
    if (options != null)
        _options = options;
    if (!_options.hasOwnProperty('customValidators'))
        _options['customValidators'] = {};
    if (!_options.hasOwnProperty('customSanitizers'))
        _options['customSanitizers'] = {};
    return middleware;
}

module.exports = validador;