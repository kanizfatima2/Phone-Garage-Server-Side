const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// const jwt = require('jsonwebtoken');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

//Database Connection 


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.PASSWORD}@cluster0.vtpihie.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });





async function run() {
    try {
        const CategoriesCollection = client.db('phone-garage').collection('categories')

        app.get('/categories', async (req, res) => {
            const result = await CategoriesCollection.find({}).toArray();
            res.send(result)
        })

    }


    finally {

    }
}
run().catch(err => console.error(err))

app.get('/', (req, res) => {
    res.send('Phone-Garage is Running')
})
app.listen(port, (req, res) => {
    console.log('Listening to port ', port)
})
