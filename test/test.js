var assert = require('assert');
var test = require('tap').test;
var Sublevel = require('level-sublevel');
var sql = require('../index');
var level = require('level');

var db = Sublevel(level(__dirname + '/db', { valueEncoding: 'json' }));
sql(db);

// TODO: destroy the database every time.

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

test('SELECT a, b from table1', function(t) {

  var table1 = db.sublevel('table1');

  table1.batch([
    { type: 'put', key: 'testkey1', value: { a: 'avalue1', b: 'bvalue1' } },
    { type: 'put', key: 'testkey2', value: { a: 'avalue2', b: 'bvalue2' } }
  ], function(err) {

    if (err) {
      return t.notOk(true, err);
    }
    
    var s1 = db.query('SELECT a, b FROM table1');
 
    var count = 0

    s1.on('data', function(d) {
      t.ok(d.value.a && d.value.b);
      if (++count == 2) {
        t.ok(true, 'found two records from table1');
        t.end();
      }
    });
  });
});

test('SELECT b from table1 WHERE b = "bvalue2"', function(t) {

  var table1 = db.sublevel('table1');

  table1.batch([
    { type: 'put', key: 'testkey1', value: { a: 'avalue1', b: 'bvalue1' } },
    { type: 'put', key: 'testkey2', value: { a: 'avalue2', b: 'bvalue2' } }
  ], function(err) {

    if (err) {
      return t.notOk(true, err);
    }
    
    var s1 = db.query('SELECT b FROM table1 WHERE b = "bvalue2"');
 
    var count = 0

    s1.on('data', function(d) {
      if (++count == 1) {
        t.ok(true, 'fouond only one record');
        t.end();
      }
    });
  });
});

// compound where clauses should compare recursively
test('SELECT b,a from table1 WHERE b = "bvalue2" and a = "avalue2"', function(t) {

  var table1 = db.sublevel('table1');

  table1.batch([
    { type: 'put', key: 'testkey1', value: { a: 'avalue1', b: 'bvalue1' } },
    { type: 'put', key: 'testkey2', value: { a: 'avalue2', b: 'bvalue2' } }
  ], function(err) {

    if (err) {
      return t.notOk(true, err);
    }
    
    var s1 = db.query('SELECT b,a FROM table1 WHERE b = "bvalue2" and a = "avalue2"');
 
    var count = 0

    s1.on('data', function(d) {
      t.ok(d.value.b && d.value.a, 'record has a valid member');
    }).on('end', function() {
      t.equal(count, 0, 'only one record found');
      t.end();
    });
  });
});

// values that don't exist shouldn't yield any results.
test('SELECT b,a from table1 WHERE b = "bvalue2" and a = "avalue1"', function(t) {

  var table1 = db.sublevel('table1');

  table1.batch([
    { type: 'put', key: 'testkey1', value: { a: 'avalue1', b: 'bvalue1' } },
    { type: 'put', key: 'testkey2', value: { a: 'avalue2', b: 'bvalue2' } }
  ], function(err) {

    if (err) {
      return t.notOk(true, err);
    }
    
    var s1 = db.query('SELECT b,a FROM table1 WHERE b = "bvalue2" and a = "avalue1"');
 
    var records = 0;

    s1.on('data', function(d) {
      ++records;
    }).on('end', function() {
      t.equal(records, 0, 'no records found');
      t.end();
    });
  });
});

test('SELECT * FROM table1 LIMIT 2', function(t) {

  var table1 = db.sublevel('table1');

  table1.batch([
    { type: 'put', key: 'testkey1', value: { a: 'avalue1', b: 'bvalue1' } },
    { type: 'put', key: 'testkey2', value: { a: 'avalue2', b: 'bvalue2' } },
    { type: 'put', key: 'testkey3', value: { a: 'avalue3', b: 'bvalue3' } },
    { type: 'put', key: 'testkey4', value: { a: 'avalue4', b: 'bvalue4' } },
    { type: 'put', key: 'testkey5', value: { a: 'avalue5', b: 'bvalue5' } }
  ], function(err) {

    if (err) {
      return t.notOk(true, err);
    }
    
    var s1 = db.query('SELECT * FROM table1 LIMIT 2');
 
    var records = 0;

    s1.on('data', function(d) {
      ++records;
    }).on('end', function() {
      t.equal(records, 2, 'no records found');
      t.end();
    });
  });
});

test('SELECT * FROM table1 ORDER BY c ASC, d DESC', function(t) {

  var table1 = db.sublevel('table1');

  table1.batch([
    { type: 'put', key: 'testkey1', value: { a: 'avalue1', b: 'bvalue1', c: '5', d: '5' } },
    { type: 'put', key: 'testkey2', value: { a: 'avalue2', b: 'bvalue2', c: '4', d: '4' } },
    { type: 'put', key: 'testkey3', value: { a: 'avalue3', b: 'bvalue3', c: '3', d: '3' } },
    { type: 'put', key: 'testkey4', value: { a: 'avalue4', b: 'bvalue4', c: '2', d: '2' } },
    { type: 'put', key: 'testkey5', value: { a: 'avalue5', b: 'bvalue5', c: '1', d: '1' } }
  ], function(err) {

    if (err) {
      return t.notOk(true, err);
    }
    
    var s1 = db.query('SELECT * FROM table1 ORDER BY c ASC, d DESC');
 
    s1.on('data', function(d) {
      console.log(d)
    }).on('end', function() {
      t.end();
    });
  });
});

