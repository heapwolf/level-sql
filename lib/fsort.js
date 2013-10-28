
module.exports = function(a) {

  var n = a.length;

  var i = 0, j = 0, k = 0, t;
  var m = ~~( n * 0.125 );
  var a_nmin = a[ 0 ];
  var nmax = 0;
  var nmove = 0;

  var l = new Array(m);
  for ( i = 0; i < m; i++ ) {
    l[ i ] = 0;
  }

  for ( i = 1; i < n; ++i ) {
    var a_i = a[ i ];
    if ( a_i < a_nmin ) { a_nmin = a_i; }
    if ( a_i > a[ nmax ] ) { nmax = i; }
  }

  var a_nmax = a[ nmax ];
  if ( a_nmin === a_nmax) { return a; }
  var c1 = ( m - 1 ) / ( a_nmax - a_nmin );

  for ( i = 0; i < n; ++i ) {
      ++l[ ~~( c1 * ( a[ i ] - a_nmin ) ) ];
  }

  for ( k = 1; k < m; ++k ) {
      l[ k ] += l[ k - 1 ];
  }

  var hold = a_nmax;
  a[ nmax ] = a[ 0 ];
  a[ 0 ] = hold;

  var flash;
  j = 0;
  k = m - 1;
  i = n - 1;

  while ( nmove < i ) {
    while ( j > ( l[ k ] - 1 ) ) {
        k = ~~( c1 * ( a[ ++j ] - a_nmin ) );
    }
    // line below added 07/03/2013, ES
    if (k < 0) { break; }

    flash = a[ j ];

    while ( j !== l[ k ] ) {

      k = ~~( c1 * ( flash - a_nmin ) );
      hold = a[ t = --l[ k ] ];
      a[ t ] = flash;
      flash = hold;
      ++nmove;
    }
  }

  for( j = 1; j < n; ++j ) {

    hold = a[ j ];
    i = j - 1;
    while( i >= 0 && a[i] > hold ) {
        a[ i + 1 ] = a[ i-- ];
    }
    a[ i + 1 ] = hold;
  }

  return a;
};
