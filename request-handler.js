const Fs = require('fs');
const Url = require('url');
const Path = require('path');


module.exports = (db) => {
  return function requestHandler(req, res) {  
    const method = req.method;
    const pathname = Url.parse(req.url).pathname;

    if (method === 'GET' && pathname === '/') {
      return Fs.readFile(Path.join(__dirname, 'index.html'), (err, data) => {
        if (err) {
          console.log(err);
          res.writeHead(404, { 'Content-Type': 'text/html' });
        } else {	``
          res.writeHead(200, { 'Content-Type': 'text/html' });	
          res.write(data.toString());		
        }
        return res.end();
      });
    }

    if (method === 'GET' && pathname === '/sites') {
      // TODO: query by cityId
      return db.collection("sites").find({}).toArray((err, sites) => {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': 'application/json' });	
        res.write(JSON.stringify(sites));
        res.end();
      });
    }  
    
    if (method === 'PUT' && pathname === '/sites/multi_update') {
      let sitesOnChange = [], idsNotFound = [], dbUpdates = 0;
      
      req.on('data', (chunk) => {
        sitesOnChange.push(chunk);
      })  
      
      req.on('end', () => {
        sitesOnChange = JSON.parse(Buffer.concat(sitesOnChange).toString());
        const sitesUpdating = sitesOnChange.map(site => {
          try {
            return  { 
                     id: site.id,
                     connection: db.collection("sites").updateOne({ "_id" : site.id }, { $set : site.attr }, { upsert: false })
                    };
          } catch (e) {
            return 0;
          }
        })
        
        return Promise.all(sitesUpdating).then(tupples => {
            let idsNotFound = []; 
            for(t in tupples) {
              if(t.connection.result.n === 0)
                idsNotFound.push(t.id);
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });	
            res.write(JSON.stringify(idsNotFound));
            res.end();                  
          });
        });
    } 
    
    if(method === 'GET' && pathname.match(/id/)) { 
      let respData = {},
          idsOnLoad =  req.url.split('?')[1]
                              .split('&')
                              .map(idStr => parseInt(idStr));

      db.collection("sites").find( { _id: { $in: idsOnLoad } } ).toArray((err, sites) => {
          if (err) throw err;
          respData.sites = sites;
          respData.idsNotFound = idsOnLoad.filter(id => !sites.map(site=>site._id).includes(id));
          res.writeHead(200, {'Content-Type': 'application/json'});	
          res.write(JSON.stringify(respData));
          res.end();
      });
    }
    
    if (true)  {
      Fs.readFile(Path.join(__dirname, 'public', pathname), (err, data) => {
        if (err || !(pathname.match(/js$/) || pathname.match(/css$/))){
            console.log(err);
            res.writeHead(404, {'Content-Type': 'text/html'});
        } else {	
            res.writeHead(200, {'Content-Type': pathname.match(/js$/) ? 'text/javascript' : 'text/css' });	
            res.write(data.toString());		
        }
        res.end();
      });
    }
  } 
}

// 1. generic files response v
// 4. load by: cityId v
// 5. make the app look good v
// -------
// 2. http://localhost:8080/sites/1 --> ?
// 3. format the code to be clean and readable as much as you can v?
// -------
// *fix id not found error on fields with no id 
// *fix name delete through update
// *fix console timeout

// connect to visitt db