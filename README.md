# MOTIVATION
So you are happy with your very small, very fast key value store. 
But now for some reason you think you need SQL. Ok, fine. Here is 
a module.

# USAGE
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

### Select Any
Given a table T, the query `SELECT * FROM T` will result in all 
the elements of all the rows of the table being shown.
```js
var stream1 = db.query('SELECT * from table1');
```

```json
{ "key": "key1", "value": { "a": 0, "b": 1 } }
{ "key": "key2", "value": { "a": 2, "b": 3 } }
```

### Select Specific
With the same table, the query `SELECT K FROM T` will result in 
the elements from the key `K` of all the rows of the table being 
shown.

```js
var stream1 = db.query('SELECT a from table1');
```

```json
{ "key": "key1", "value": { "a": 0 } }
{ "key": "key2", "value": { "a": 2 } }
```

### Where Clauses
With the same table, the query `SELECT * FROM T WHERE K1 = 2` will 
result in all the elements of all the rows where the value of column 
`K1` is `2` being shown — in Relational algebra terms, a selection 
will be performed, because of the `WHERE` clause. This is also known 
as a Horizontal Partition, restricting rows output by a query 
according to specified conditions. There can be as many conditions
as you want separated by `and` or `or`.

```js
var stream1 = db.query('SELECT a from table1 WHERE a = 2 and a <> 1');
```

```json
{ "key": "key2", "value": { "a": 2 } }
```

# TODO
This is a work in progress, and I don't plan to give it a ton 
of attention, if you like this idea ping me and I will add you
as a contributor.

