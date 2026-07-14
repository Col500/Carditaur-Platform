const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("app.use('/flyers', express.static(path.join(process.cwd(), 'public', 'flyers')));", `app.use('/flyers', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  }, express.static(path.join(process.cwd(), 'public', 'flyers')));`);

fs.writeFileSync('server.ts', code);
