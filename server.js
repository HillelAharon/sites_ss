const Http = require('http');
const MongoClient = require('mongodb').MongoClient;
const RequestHandler = require('./request-handler');

const MONGO_URL = "mongodb://localhost:27017/";

MongoClient.connect(MONGO_URL, { useNewUrlParser: true }, (err, client) => {
   if (err) throw err;
   db = client.db("gantzi");
   
   const server = Http.createServer(RequestHandler(db));   
   server.listen(8080, (err) => {
      if (err) {
         console.log('Error starting server', err);
         return client.close();
      }
      console.log('Server start on port 8080');
   });
});