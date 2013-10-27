var assert = require('assert');
var test = require('tap').test;
var Sublevel = require('level-sublevel');
var sql = require('../index');
var level = require('level');

var db = Sublevel(level(__dirname + '/db', { valueEncoding: 'json' }));
sql(db);

test('SELECT * from table1', function(t) {

  var table1 = db.sublevel('table1');

  table1.batch([
    { type: 'put', key: 'testkey1', value: { a: 'avalue1', b: 'bvalue1' } },
    { type: 'put', key: 'testkey2', value: { a: 'avalue2', b: 'bvalue2' } }
  ], function(err) {

    if (err) {
      return t.notOk(true, err);
    }

    var s1 = db.query('SELECT * FROM table1');
 
    var count = 0

    s1.on('data', function(d) {
      if (++count == 2) {
        t.ok(true, 'found all records from table1');
        t.end();
      }
    });
  });
});

test('SELECT a from table1', function(t) {

  var table1 = db.sublevel('table1');

  table1.batch([
    { type: 'put', key: 'testkey1', value: { a: 'avalue1', b: 'bvalue1' } },
    { type: 'put', key: 'testkey2', value: { a: 'avalue2', b: 'bvalue2' } }
  ], function(err) {

    if (err) {
      return t.notOk(true, err);
    }
    
    var s1 = db.query('SELECT a FROM table1');
 
    var count = 0

    s1.on('data', function(d) {
      t.equal(d.value.a.indexOf('avalue'), 0, 'correct value');
      if (++count == 2) {
        t.ok(true, 'found two records from table1');
        t.end();
      }
    });
  });
});

