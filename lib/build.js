var fs = require('fs');
var parser = require(__dirname + '/grammar').parser;
fs.writeFileSync(__dirname + '/compiled_parser.js', parser.generate());

