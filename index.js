const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const jwt = require('jsonwebtoken');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

//Database Connection 


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.PASSWORD}@cluster0.vtpihie.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

if (uri) {
    console.log('Database Connected')
}

//verify JWT Token
function verifyTokenJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}

async function run() {
    try {
        const CategoriesCollection = client.db('phone-garage').collection('categories')
        const AllPhonesData = client.db('phone-garage').collection('phones-data')
        const PhoneBookingsCollection = client.db('phone-garage').collection('phone-Bookings');
        const usersCollection = client.db('phone-garage').collection('users');

        //All Categories Phones data read
        app.get('/categories', async (req, res) => {
            const result = await CategoriesCollection.find({}).toArray();
            res.send(result)
        })

        //Read by category phones data
        app.get('/categories/:id', async (req, res) => {
            const { id } = req.params;
            const query = { phone_id: id }
            const cursor = AllPhonesData.find(query);
            // console.log(query)
            const result = await cursor.toArray();
            res.send(result)
        })

        //Create Bookings
        app.post('/phonebookings', async (req, res) => {
            const query = {
                Model: req.body.Model

            }

            const alreadyBooked = await PhoneBookingsCollection.find(query).toArray();
            if (alreadyBooked.length) {
                return res.send({
                    success: false,
                    message: `You already have a purchase of ${req.body.Model}`
                })
            }

            const result = await PhoneBookingsCollection.insertOne(req.body);
            res.send({
                success: true,
                message: 'Booking Confirmed!',
                data: result
            })


        })

        //Create user and save to database 
        app.post('/users', async (req, res) => {
            const result = await usersCollection.insertOne(req.body)
            res.send(result)
        })

        //Get user and match email address and generate token
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });

        //Get all Users in Dashboard
        app.get('/users', async (req, res) => {
            const users = await usersCollection.find({}).toArray();
            res.send(users)
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
