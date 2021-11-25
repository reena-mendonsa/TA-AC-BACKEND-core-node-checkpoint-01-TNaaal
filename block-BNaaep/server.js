var fs = require('fs');
var http = require('http');
var url = require('url');
var qs = require('querystring');


var server = http.createServer(handleRequest);

function handleRequest(req,res){
  var parsedUrl = url.parse(req.url,true);
  var store ='';
  req.on('data',(chunk)=>{

      store +=chunk;
  });
  if(req.method==='GET'&& req.url==='/'){
      fs.readFile('./index.html',(err,content)=>{
          res.setHeader('Content-Type','text/html');
          res.write(content);
          res.end();
      });
  }
  else if (req.method==='GET' && req.url ==='/about'){
      fs.readFile('./about.html',(err,content)=>{
          res.setHeader('Content-Type','text/html');
          res.write(content);
          res.end();
      });
  }else if (req.url.split('.').pop()==='css'){
      fs.readFile(__dirname + req.url,(err,content)=>{
          if(err) return console.log(err);
          res.setHeader('Content-Type','text/css');
          res.end(content);
      });
  }else if (req.url.split('.').pop() === 'jpg') {
    fs.readFile(__dirname + req.url, (err, content) => {
      if (err) return console.log(err);
      res.setHeader('Content-Type', 'image/jpg');
      res.end(content);
    });
  } else if (req.url.split('.').pop() === 'png') {
    fs.readFile(__dirname + req.url, (err, content) => {
      if (err) return console.log(err);
      res.setHeader('Content-Type', 'image/png');
      res.end(content);
    });
  } else if (req.method === 'GET' && req.url === '/contact') {
    fs.readFile('./contactform.html', (err, content) => {
      res.setHeader('Content-Type', 'text/html');
      res.end(content);
    });
  }
  req.on('end', () => {
    if (req.method === 'POST' && req.url === '/form') {
      var username = JSON.parse(store).username;
      console.log(username);
      let parseData = qs.parse(store);
      fs.open(
        __dirname + '/contacts/' + username + '.json',
        'wx',
        (err, fd) => {
          if (err) return res.end('username already taken');
          fs.writeFile(fd,store , (err) => {
            if (err) return console.log(err);
            fs.close(fd, () => {
              return res.end(`${username} contacts saved`);
            });
          });
        }
      );
    }
    if (req.method === 'GET' && parsedUrl.pathname === '/users') {
      var username = parsedUrl.query.username;
      console.log(parsedUrl);
      fs.readFile(
        __dirname + '/contacts/' + username + '.json',
        (err, content) => {
          res.setHeader('Content-Type', 'application/json');
          let parseData = JSON.parse(content);

          res.end(`<h1>${parseData.name}</h1>
                <h2>${parseData.email}</h2>
                <h2>${parseData.username}</h2>
                <h2>${parseData.age}</h2>
                <h2>${parseData.bio}</h2>`);
        }
      );
    }
    
    if (req.method === 'GET' && parsedUrl.pathname === '/allusers') {
        
        fs.readdirSync(__dirname + '/contacts').filter((file) => {
          fs.readFile(
            __dirname + '/contacts/' + file,
            'utf-8',
            (err, content) => {
              console.log(content);
              
          
          
            });
            
        });
        
      }
  });

}

server.listen(5000,()=>{
    console.log("Server is listening at 5k");
});