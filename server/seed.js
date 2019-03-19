const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = "mongodb://localhost:27017/";

module.exports = () => { 
   MongoClient.connect(MONGO_URL, {useNewUrlParser: true}, (err, db) => {
    if (err) throw err;
    dbo = db.db("sites");
    let myobj = [
       {_id: 0, name: 'visitt', address: 'begin 7', type: 'a', serialNumber: '123', phone: '0500000004', qrCode: 'fx3'},
       {_id: 1, name: 'shmisitt', address: 'shmegin 90', type: 'b', serialNumber: '456', phone: '053', qrCode: '4ds'},
       {_id: 2, name: 'shtlizik', address: 'shblublu 5', type: 'c', serialNumber: '789', phone: '052', qrCode: 'f5t'},
       {_id: 3, name: 'visitt', address: 'begin 7', type: 'a', serialNumber: '123', phone: '054', qrCode: 'fx3'},
       {_id: 4, name: 'shmisitt', address: 'shmegin 90', type: 'b', serialNumber: '456', phone: '053', qrCode: '4ds'},
       {_id: 5, name: 'shtlizik', address: 'shblublu 5', type: 'c', serialNumber: '789', phone: '052', qrCode: 'f5t'},
       {_id: 6, name: 'visitt', address: 'begin 7', type: 'a', serialNumber: '123', phone: '054', qrCode: 'fx3'},
       {_id: 7, name: 'shmisitt', address: 'shmegin 90', type: 'b', serialNumber: '456', phone: '053', qrCode: '4ds'},
       {_id: 8, name: 'shtlizik', address: 'shblublu 5', type: 'c', serialNumber: '789', phone: '052', qrCode: 'f5t'},
       {_id: 9, name: 'visitt', address: 'begin 7', type: 'a', serialNumber: '123', phone: '054', qrCode: 'fx3'},
       {_id: 10, name: 'shmisitt', address: 'shmegin 90', type: 'b', serialNumber: '456', phone: '053', qrCode: '4ds'},
       {_id: 11, name: 'shtlizik', address: 'shblublu 5', type: 'c', serialNumber: '789', phone: '052', qrCode: 'f5t'},
       {_id: 12, name: 'visitt', address: 'begin 7', type: 'a', serialNumber: '123', phone: '054', qrCode: 'fx3'},
       {_id: 13, name: 'shmisitt', address: 'shmegin 90', type: 'b', serialNumber: '456', phone: '053', qrCode: '4ds'},
       {_id: 14, name: 'shtlizik', address: 'shblublu 5', type: 'c', serialNumber: '789', phone: '052', qrCode: 'f5t'},
       {_id: 15, name: 'visitt', address: 'begin 7', type: 'a', serialNumber: '123', phone: '054', qrCode: 'fx3'},
       {_id: 16, name: 'shmisitt', address: 'shmegin 90', type: 'b', serialNumber: '456', phone: '053', qrCode: '4ds'},
       {_id: 17, name: 'shtlizik', address: 'shblublu 5', type: 'c', serialNumber: '789', phone: '052', qrCode: 'f5t'},
       {_id: 18, name: 'visitt', address: 'begin 7', type: 'a', serialNumber: '123', phone: '054', qrCode: 'fx3'},
       {_id: 19, name: 'shmisitt', address: 'shmegin 90', type: 'b', serialNumber: '456', phone: '053', qrCode: '4ds'},
       {_id: 20, name: 'shtlizik', address: 'shblublu 5', type: 'c', serialNumber: '789', phone: '052', qrCode: 'f5t'},
       {_id: 21, name: 'visitt', address: 'begin 7', type: 'a', serialNumber: '123', phone: '054', qrCode: 'fx3'},
       {_id: 22, name: 'shmisitt', address: 'shmegin 90', type: 'b', serialNumber: '456', phone: '053', qrCode: '4ds'},
       {_id: 23, name: 'shtlizik', address: 'shblublu 5', type: 'c', serialNumber: '789', phone: '052', qrCode: 'f5t'},
       {_id: 24, name: 'visitt', address: 'begin 7', type: 'a', serialNumber: '123', phone: '054', qrCode: 'fx3'},
       {_id: 25, name: 'shmisitt', address: 'shmegin 90', type: 'b', serialNumber: '456', phone: '053', qrCode: '4ds'},
       {_id: 26, name: 'shtlizik', address: 'shblublu 5', type: 'c', serialNumber: '789', phone: '052', qrCode: 'f5t'},
       {_id: 27, name: 'visitt', address: 'begin 7', type: 'a', serialNumber: '123', phone: '054', qrCode: 'fx3'},
       {_id: 28, name: 'shmisitt', address: 'shmegin 90', type: 'b', serialNumber: '456', phone: '053', qrCode: '4ds'},
       {_id: 29, name: 'shtlizik', address: 'shblublu 5', type: 'c', serialNumber: '789', phone: '052', qrCode: 'f5t'},
       {_id: 30, name: 'visitt', address: 'begin 7', type: 'a', serialNumber: '123', phone: '054', qrCode: 'fx3'},
       {_id: 31, name: 'shmisitt', address: 'shmegin 90', type: 'b', serialNumber: '456', phone: '053', qrCode: '4ds'},
       {_id: 32, name: 'shtlizik', address: 'shblublu 5', type: 'c', serialNumber: '789', phone: '052', qrCode: 'f5t'},
       {_id: 33, name: 'visitt', address: 'begin 7', type: 'a', serialNumber: '123', phone: '054', qrCode: 'fx3'},
       {_id: 34, name: 'shmisitt', address: 'shmegin 90', type: 'b', serialNumber: '456', phone: '053', qrCode: '4ds'},
       {_id: 35, name: 'shtlizik', address: 'shblublu 5', type: 'c', serialNumber: '789', phone: '052', qrCode: 'f5t'}
    ];
    dbo.collection('sites').deleteMany({});
    dbo.collection("sites").insertMany(myobj, (err, res) => {
       if (err) throw err;
       db.close();
    });
 });
}
 