//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        return console.log('Unable to connect to Mongo DB server');
    }
    console.log('Connected to Mongo DB server');
    const db = client.db('TodoApp');
    
    db.collection('Todos').deleteMany({text: 'Learn node'}).then((result) => {
        console.log(result);
    });
    
    db.collection('Todos').deleteOne({text: 'walk the dog'}).then((result) => {
        console.log(result);
    });
    
    db.collection('Todos').findOneAndDelete({completed: true}).then((result) => {
        console.log(result);
    });

    
    //client.close();
});