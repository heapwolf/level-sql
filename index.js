
var parse = require('./lib/parse').parse;
var sublevel = require('level-sublevel');
var through = require('through');

module.exports = function(db) {
 
  var op = /^(<>|>|<|>=|<=|=)$/;

  db.query = function() {
    
    var q = [].slice.call(arguments);
    var ast;

    try {
      ast = parse(q.join(' '));
    }
    catch(ex) {
      throw ex;
    }

    // determine if there are SELECT keys
    var hasFields = Object.keys(ast.fields[0]).length;

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
    }

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
        this.push({ key: obj.key, value: val });
      }
    });

    // TODO: multiple sources
    var source1 = ast.source.name.value;
    var table1 = db.sublevel(source1);
    var opts1 = {};

    return table1.createReadStream(opts1).pipe(filter);
  }
  return db
};

