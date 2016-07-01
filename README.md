# validador

## Installation

```bash
npm install validador
```

## Usage

```js
var express = require('express');
var bodyParser = require('body-parser');
var validador = require('validador');

var options = {
    errorMessage: 'Validation Error', // To set the default error message
    customValidators: {
        isSomething: function(value) {
            return true; 
        }
    },
    customSanitizers: {
        mySanitizer: function(value) {
            return value;
        }
    }
}

app.use(bodyParser.json());
app.use(validador(options));

app.get('/:param', function(req, res, next) {
    req.validador('param', 'params', 'isNumeric|Param must be a number');
});

// TODO: finish this readme

app.listen(3000);
```