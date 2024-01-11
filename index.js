const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const multer = require('multer');
const path = require('path');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g9xsrko.mongodb.net/?retryWrites=true&w=majority`;

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the destination directory for uploaded files
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Generate a unique filename using the client ID and original file extension
    const clientId = req.params.clientId;
    const originalName = file.originalname;
    const fileExtension = path.extname(originalName);
    const fileName = `${clientId}_${Date.now()}${fileExtension}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

// Create a MongoDB client outside the run function
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    const attachmentCollection = client.db("seoTask").collection("attachments");

    // Define the '/upload/:clientId' endpoint to handle file uploads
    app.post('/upload/:clientId', upload.single('file'), async (req, res) => {
      try {
        const clientId = req.params.clientId;
        const file = req.file;

        // Store information about the file in the "attachments" collection
        const attachmentInfo = {
          clientId,
          filename: file.filename,
          originalname: file.originalname,
          destination: file.destination,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
        };

        const result = await attachmentCollection.insertOne(attachmentInfo);

        res.status(200).send({ message: 'File uploaded successfully', attachmentId: result.insertedId });
      } catch (error) {
        console.error('Error handling file upload:', error);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    });

    app.get('/attachments/:clientId', async (req, res) => {
      try {
        const clientId = req.params.clientId;
        const result = await attachmentCollection.find({ clientId }).toArray();
        res.send(result);
      } catch (error) {
        console.error('Error fetching uploaded files:', error);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    });

    app.get('/', (req, res) => {
      res.send('seo task is running');
    });

    app.listen(port, () => {
      console.log(`seo task is on port: ${port}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

run().catch(console.dir);
