const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();


function verifyJWT(req, res, next){
    console.log('abc')
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'unAuthorization Access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'Forbedden Access'})
        }
        req.decoded = decoded
        next();
    });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lfbfx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const itemsCollection = client.db('Menufecturer-Co').collection('items');
        const bookingCollection = client.db('Menufecturer-Co').collection('booking');
        const userCollection = client.db('Menufecturer-Co').collection('users');

        app.get('/items', async (req, res)=>{
            const query = {};
            const cursor = itemsCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        })

        app.get('/items/:id', async (req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const item = await itemsCollection.findOne(query);
            res.send(item);
        })

        app.get('/booking', verifyJWT, async (req, res)=>{
            const email = req.query.email;
            const authorization = req.headers.authorization;
            console.log('inside Auth', authorization)
            const query = {email: email};
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);
        })

        app.get('/user', verifyJWT, async (req, res)=>{
            const users = await userCollection.find().toArray();
            res.send(users)
        })

        app.put('/user/admin/:email', async (req, res) =>{
            const email = req.params.email;
            const filter = {email: email};
            const updateDoc = {
                $set: {role: 'admin'},
            }
            const result = await userCollection.updateOne(filter, updateDoc)
           
            res.send(result)
        })

        app.put('/user/:email', async (req, res) =>{
            const email = req.params.email;
            const user = req.body;
            const filter = {email: email};
            const options = {upsert: true};
            const updateDoc = {
                $set: user,
            }
            const result = await userCollection.updateOne(filter, updateDoc, options)
            const token = jwt.sign({email:email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
            res.send({result, token})
        })

        app.post('/booking', async (req, res) =>{
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            
            res.send(result);
        })
    }
    finally{

    }
}
run().catch(console.dir);

//middlware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) =>{
    res.send('running Menufec-Co')
})

app.listen(port, ()=>{
    console.log('Lisining port', port)
})