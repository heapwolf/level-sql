
var parse = require('./lib/parse').parse;
var sublevel = require('level-sublevel');
var through = require('through');
var fsort = require('./lib/fsort');

module.exports = function(db) {
 
  var op = /^(<>|>|<|>=|<=|=)$/;

  db.query = function() {
    
    var q = [].slice.call(arguments);
    var ast;
    var sortable = [];

    try {
      ast = parse(q.join(' '));
    }
    catch(ex) {
      throw ex;
    }

    // determine if there are SELECT keys
    var hasFields = Object.keys(ast.fields[0]).length;

    var orderby = function(data) {

      // throw away keys
      // make an array of objects
      // write the objects as they are sorted by fsort
      // return the new array
      
    };

    // resolve where clauses recursively
    var where = function(ops, data) {

      var operator;

      if (ops.operation) {
        operator = ops.operation.match(op);
      }

      if (operator && data) {
        
        var a = data[ops.left.value];
        var b = ops.right.value;

        switch(operator[0]) {
          case "=": return a === b; break;
          case ">": return a > b; break;
          case "<": return a < b; break;
          case ">=": return a >= b; break;
          case "<=": return a <= b; break;
          case "<>": return a !== b; break;
        }
      }
      else if (ops.right && ops.left) {
        var right = where(ops.right, data);
        var left = where(ops.left, data);
      }
      if (ops.operation == 'and') {
        return right && left;
      }
      else if (ops.operation == 'or') {
        return right || left;
      }
    };

    // apply the SELECT filter
    var filter = through(function (obj) {

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
          if (hasFields && key != ast.fields[j].field.value) {
            continue;
          }
          if (ast.where) {
            if (!where(ast.where.conditions, obj.value)) {
              continue;
            }
          }
          val[key] = obj.value[key];
        }
      }

      if (Object.keys(val).length) {
        if (ast.order) {
          return sortable.push(obj.value);
        }
        this.push({ key: obj.key, value: val });
      }
    });

    var source = ast.source.name.value;
    var table = db.sublevel(source);
    var opts = {};

    if (ast.limit && ast.limit.value) {
      opts.limit = ast.limit.value.value;
    }

    var stream = table.createReadStream(opts).pipe(filter);

    if (ast.order) {
      var t = through();
      stream.on('end', function() {
        t.write(orderby(ast.fields, sortable));
        t.end();
      });
      return t;
    }
    return stream;
  }
  return db
};

