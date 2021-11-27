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

  req.on('end', () => {
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
    fs.readFile('./contact.html', (err, content) => {
      res.setHeader('Content-Type', 'text/html');
      res.end(content);
    });
  }
 
    else if (req.method === 'POST' && req.url === '/form') {
      let formatData = req.headers['content-type'];
      if(formatData ==='application/json'){
        var username = JSON.parse(store).username;
       
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
      }else{
        var username =qs.parse(store).username ;
        if(username === ''){
          return res.end('Username is mandatory!');
        }
        let parseData = qs.parse(store);
        console.log(parseData);
        fs.open(
          __dirname + '/contacts/' + username + '.json',
          'wx',
          (err, fd) => {
            if (err) return res.end('username already taken');
            fs.writeFile(fd,JSON.stringify(parseData), (err) => {
              if (err) return console.log(err);
              fs.close(fd, () => {
                return res.end(`${username} contacts saved`);
              });
            });
          }
        );
      }
      
      
      
      
    }
    else if (req.method === 'GET' && parsedUrl.pathname === '/users') {
      
      console.log(Object.keys(parsedUrl.query).length);
      if(Object.keys(parsedUrl.query).length !== 0){
        var username = parsedUrl.query.username;
        fs.readFile(
          __dirname + '/contacts/' + username + '.json',
          (err, content) => {
            res.setHeader('Content-Type', 'text/html');
            let parseData = JSON.parse(content);

             res.end(`<h1>Name:${parseData.name}</h1>
                <h2>Email:${parseData.email}</h2>
                <h2>Username:${parseData.username}</h2>
                <h2>Age:${parseData.age}</h2>
                <h2>Bio:${parseData.about}</h2>`);
          }
        );
      }
      else {
    // else if (req.method === 'GET' && parsedUrl.pathname === '/allusers') {
        
        res.setHeader('Content-Type', 'text/html');
        fs.readdirSync(__dirname + '/contacts').forEach((file) => {
          fs.readFile(
            __dirname + '/contacts/' + file,
            'utf-8',
            (err, content) => {
              console.log(content);
              
              var data = JSON.parse(content.toString());
              var user = `<h1>Name:${data.name}</h1>
              <h2>Email:${data.email}</h2>
              <h2>Username:${data.username}</h2>
              <h2>Age:${data.age}</h2>
              <h2>Bio:${data.about}</h2><hr>`              
             res.write(user);          
            });
            
        });
       setTimeout(()=>{res.end()},1000);//since  readFile is an async operation 
     }
    } 
    else{
       res.end('Page not Found');
    } 
  });

}

server.listen(5000,()=>{
    console.log("Server is listening at 5k");
});