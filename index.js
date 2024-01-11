const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g9xsrko.mongodb.net/?retryWrites=true&w=majority`;

async function run() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    const attachmentCollection = client.db("seoTask").collection("attachments");

    app.get('/attachments', async (req, res) => {
      const result = await attachmentCollection.find().toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.get('/', (req, res) => {
      res.send('seo task is running');
    });

    app.listen(port, () => {
      console.log(`seo task is on port: ${port}`);
    });
  } finally {
    // Close the client when the application exits
    // This ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);
