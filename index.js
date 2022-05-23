const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lfbfx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  console.log('Menufecturer Connected')
  // perform actions on the collection object
  client.close();
});


//middlware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) =>{
    res.send('running Menufec-Co')
})

app.listen(port, ()=>{
    console.log('Lisining port', port)
})