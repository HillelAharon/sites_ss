const Fs = require('fs');
const Url = require('url');
const Path = require('path');

const VALID_ATTR_ARR = ['_id','name','address','type','serialNumber','phone','qrCode'];
const IRRELEVANT_ATTR = ['cityId', 'companyId', 'createdBy', 'inspectionInterval', ' inspectorIds', 'operatorIds', 'tasks', 'isBeingInspected', 'createdAt', 'isPublicToOperators', 'updatedAt', 'updatedBy'];

module.exports = (db) => {
  return function requestHandler(req, res) {  
    const method = req.method;
    const {pathname, search} = Url.parse(req.url);

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
    
    if (method === 'GET' && pathname === '/sites') {
      const query = {};
      const params = search ? search.slice(1).split('&').reduce((params, string) => {
        const [key, value] = string.split('=');
        return {
          ...params,
          [key]: value.startsWith('[') ? value.split('[')[1].split(']')[0].split(',') : [value]
        }
      }, {}) : {} ;

      if (params._id) query._id = { $in: params._id };

      if (params.cityId) query.cityId = { $in: params.cityId };

      db.collection("sites").find(query).toArray((err, sites) => {
        sites.forEach(site => trimSite(site));
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
        let errors = [];
        const sitesAttributeToUpdate = JSON.parse(Buffer.concat(data).toString()); 
        errors.push(...attributesUpdateValidation(sitesAttributeToUpdate));
        
        const sitesUpdating = sitesAttributeToUpdate.map(site => {
          try {
            return db.collection("sites").updateOne({ "_id" : site.id }, { $set: site.attr }); 
          } catch (e) {
            return 0;
          }
        })
        
        Promise.all(sitesUpdating).then(results => {
          for (let i = 0; i < results.length; i++) {
            const siteId = sitesAttributeToUpdate[i].id;
            if ( results[i] === 0 ) {
              const errStr = `error: in site ${siteId} database connection occured`;
              errors.push(errStr)
            }        
          }          
          res.writeHead(200, { 'Content-Type': 'application/json' });	
          res.write(JSON.stringify(errors));
          res.end();                  
        });
      });
      return;
    } 
  
    if (method === 'GET' &&  pathname.match(/.(css|js|png)$/))  {
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


function attributesUpdateValidation(sitesAttributeToUpdate){
  let res = [];
  for(let site of sitesAttributeToUpdate )
  {
    for(let a of Object.keys(site.attr) )
    {
      if( VALID_ATTR_ARR.find( x => x === a ) === -1 ) {
        res.push(`in site ${site.id}, attribute ${a} is invalid`);
        delete site[a];
      }
      if( a === 'name' && site.attr.a === '') {
        res.push(`in site ${site.id}, deleting sites name is forbidden`);
        delete site[a];
      }
    }
    return res;
  }
}

function trimSite(site){
  for(let attr of IRRELEVANT_ATTR) 
    delete site[attr];
}
//missions accomplished?
// TODO: add validation 
// TODO: sitesUpdating is not an array of promises
// TODO: add rule here
// TODO: add image
 // GET /sites?ids=[0,1,2]


// connect to visitt db