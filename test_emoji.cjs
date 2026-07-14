const http = require('https');
http.request('https://fonts.gstatic.com/s/e/notoemoji/latest/1f996/512.webp', { method: 'HEAD' }, (res) => {
  console.log(res.statusCode);
}).end();
