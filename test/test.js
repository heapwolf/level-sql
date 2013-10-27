var assert = require('assert');
var test = require('tap').test;
var Sublevel = require('level-sublevel');
var Relate = require('../index');
var level = require('level');

test('SELECT * from db1', function(t) {

  var db1 = Sublevel(level(__dirname + '/db1', { valueEncoding: 'json' }));
  var relate = Relate(db1);

  var table1 = db1.sublevel('table1');

  table1.batch([
    { type: 'put', key: 'testkey1', value: 'testvalue1' },
    { type: 'put', key: 'testkey2', value: 'testvalue2' }
  ], function(err) {

    if (err) {
      return t.notOk(true, err);
    }

    var s1 = relate.query('SELECT * FROM table1');
 
    var count = 0

    s1.on('data', function(d) {
      if (++count == 2) {
        t.ok(true, 'found all records from table1');
        t.end();
      }
    });
  });
});

