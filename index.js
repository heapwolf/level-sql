
var parse = require('./lib/parse').parse;
var sublevel = require('level-sublevel');
var through = require('through');

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
    var hasFields = Object.keys(ast.fields[0]).length;

    if (hasFields) {
      // TODO: multiple sources
      var source1 = ast.source.name.value;
      var table1 = db.sublevel(source1);
      var opts1 = {};

      var stream1 = table1
        .createReadStream(opts1)
        .pipe(through(function (obj) {

          if ( !obj.value || 
               Array.isArray(obj.value) || 
               typeof obj.value != 'object' ) {

            return; // value must be an object literal to be queried
          }

          var valkeys = Object.keys(obj.value);
          var val = {};

          for (var i = 0, il = valkeys.length; i < il; i++) {
            var key = valkeys[i];
            for (var j = 0, jl = ast.fields.length;j < jl; j++) {
              if (key == ast.fields[j].field.value) {
                val[key] = obj.value[key];
              }
            }
          }

          if (Object.keys(val).length) {
            this.push({ key: obj.key, value: val });
          }

        }));

      return stream1;
    }
    // *
    else {
      // TODO: multiple sources
      var source1 = ast.source.name.value;
      var table1 = db.sublevel(source1);
      var opts1 = {};
      var stream1 = table1.createReadStream(opts1);
      return stream1;
    }

  }
  return db
};

