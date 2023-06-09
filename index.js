const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vxma4ez.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        client.connect();

        const toysCollection = client.db('epic-heros-emporium').collection('actionToys');

        app.get('/actionToys', async (req, res) => {
            const cursor = toysCollection.find().limit(20);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/actionToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.findOne(query);
            res.send(result);
        });

        app.get('/myToys/:email', async (req, res) => {
            const email = req.params.email;
            const sorting = req.query.value;

            const result = await toysCollection.find({ seller_email: email }).sort({price: sorting}).toArray();
            res.send(result);
        })

        app.get('/toySearchByName/:search', async (req, res) => {
            const searchName = req.params.search;
            console.log(searchName);

            const result = await toysCollection.find({ toy_name: { $regex: searchName, $options: 'i' } }).toArray();

            res.send(result);
        })

        app.post('/actionToys', async (req, res) => {
            const newToy = req.body;
            console.log(newToy);
            const result = await toysCollection.insertOne(newToy);
            res.send(result);
        })

        app.patch('/actionToys/:id', async (req, res) => {
            const id = req.params.id;
            const toy = req.body;
            console.log(toy);
            const filter = {_id: new ObjectId(id)};
            const updatedToy = {
                $set: {
                    toy_name: toy.toy_name, 
                    picture: toy.picture, 
                    price: toy.price, 
                    rating: toy.rating, 
                    quantity: toy.quantity, 
                    category_name: toy.category_name, 
                    description: toy.description
                }
            }
            const result = await toysCollection.updateOne(filter, updatedToy);
            res.send(result);
        })

        app.delete('/actionToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Epic Heros Emporium Running!');
})

app.listen(port, () => {
    console.log(`Epic heros listening on port ${port}`);
})