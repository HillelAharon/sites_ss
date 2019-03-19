const Fs = require('fs');
const Url = require('url');
const Path = require('path');
const util = require('./server-util.js');

module.exports = (db) => {
  return function requestHandler(req, res) {  
    const method = req.method;
    const pathname = Url.parse(req.url).pathname;

    if (method === 'GET' && pathname === '/') {
      Fs.readFile(Path.join(__dirname, 'index.html'), (err, data) => {
        if (err) {
          console.log(err);
          res.writeHead(404, { 'Content-Type': 'text/html' });
        } else {	``
          res.writeHead(200, { 'Content-Type': 'text/html' });	
          res.write(data.toString());		
        }
        res.end();
      });
      return;
    }

     // TODO: query by cityId
    if (method === 'GET' && pathname.match(/sites/)) {
      if( req.url.match(/ids/) ) {
        let respData = {},
        idsOnLoad =  req.url.split('[')[1]
                            .split(']')[0]
                            .split(',')
                            .map(idStr => parseInt(idStr));

        db.collection("sites").find( { _id: { $in: idsOnLoad } } ).toArray((err, sites) => {
          if (err) throw err;
          respData.sites = sites; 
          respData.idsFound = idsOnLoad.filter(id => sites.map(site=>site._id).includes(id));
          respData.idsNotFound = idsOnLoad.filter(id => !sites.map(site=>site._id).includes(id));
          
          res.writeHead(200, {'Content-Type': 'application/json'});	
          res.write(JSON.stringify(respData));
          res.end();
        });
        return;
      }
      db.collection("sites").find({}).toArray((err, sites) => {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': 'application/json' });	
        res.write(JSON.stringify(sites));
        res.end();
      });
      return;
    }  
    
    if (method === 'PUT' && pathname === '/sites/multi_update') {
      let data = [];

      req.on('data', chunk => data.push(chunk));  
      
      req.on('end', () => {
        const sitesOnChange = JSON.parse(Buffer.concat(data).toString()); 
        let respData = {
          idsUpdated: [], 
          idsNotFound: [], 
          attrErr: []
        };

        respData.attrErr = util.sitesOnChangeAutentication(sitesOnChange);
        
        const sitesUpdating = sitesOnChange.map(site => {
          try {
            return db.collection("sites").updateOne({ "_id" : site.id }, { $set: site.attr }); 
          } catch (e) {
            return 0;
          }
        })
        
        Promise.all(sitesUpdating).then(results => {
          let currIndex = 0
          for ( r of results ) {
            const siteId = sitesOnChange[currIndex].id;
            util.checkAndUpdateRespData(r, siteId, respData);
            ++currIndex;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });	
          res.write(JSON.stringify(respData));
          res.end();                  
        });
      });
      return;
    } 
  
    if (method === 'GET' &&  pathname.match(/(css$|js$|png$)/))  {
      Fs.readFile(Path.join(__dirname, 'public', pathname), (err, data) => {
        if (err){
            console.log(err);
            res.writeHead(404, {'Content-Type': 'text/html'});
        } else {
            const ct = pathname.match(/js$/) ? 'text/javascript' : pathname.match(/css$/) ? 'text/css' : 'image/png';	
            res.writeHead(200, {'Content-Type':  ct });	
            res.write(data.toString());		
        }
        res.end();
      });
      return;
    }
    
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.end();
  } 
}


//missions accomplished?
// TODO: add validation 
// TODO: sitesUpdating is not an array of promises
// TODO: add rule here
// TODO: add image
 // GET /sites?ids=[0,1,2]


// connect to visitt db