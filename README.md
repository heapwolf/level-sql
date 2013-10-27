
Yes, it's possible.

```js
var level = require('level');
var sql = require('level-sql');

var db = level('./db', { valueEncoding: 'json' });
sql(db);

var stream1 = db.query('SELECT * from table1');
```

