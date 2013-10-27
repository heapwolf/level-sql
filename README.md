
Given the following key/values
```
key1  { a: 0, b: 1 }
key2  { a: 2, b: 3 } 
```

And some boilerplate
```js
var level = require('level');
var sql = require('level-sql');

var db = level('./db', { valueEncoding: 'json' });
sql(db);
```

The following query
```js
var stream1 = db.query('SELECT * from table1');
```

Produces the following result
```json
{ "key1": "key1", "value": { a: 0, b: 1 } }
{ "key2": "key2", "value": { a: 2, b: 3 } }
```

```
var stream1 = db.query('SELECT a from table1');
```


