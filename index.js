
var parse = require('./lib/parse').parse;
var sublevel = require('level-sublevel');
var through2 = require('through2');

module.exports = function(db) {
  
  db.query = function() {
    
    var q = [].slice.call(arguments);
    var ast;

    try {
      ast = parse(q.join(' '));
    }
    catch(ex) {
      return cb(ex)
    }

    // specific
    if (Object.keys(ast.fields[0]).length) {
    
    }
    // *
    else {
      // TODO: multiple sources
      var source = ast.source.name.value;
      var table = db.sublevel(source);
      var opts = {};

      return table.createReadStream(opts);
    }

  }
  return db
};

