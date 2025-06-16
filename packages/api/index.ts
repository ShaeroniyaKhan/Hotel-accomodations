///api/index.ts
import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import { MongoClient,  ObjectId  } from "mongodb";


dotenv.config();

if (process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL) {
  await import('./db/startAndSeedMemoryDB');
}

const PORT = process.env.PORT || 3001;
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
const DATABASE_URL = process.env.DATABASE_URL;

const app = express();

app.use(cors())
app.use(express.json());

app.get('/hotels', async (req, res) => {
  const mongoClient = new MongoClient(DATABASE_URL);
  console.log('Connecting to MongoDB...');

  try {
    await mongoClient.connect();
    console.log('Successfully connected to MongoDB!');
    const db = mongoClient.db()
    const collection = db.collection('hotels');
    res.send(await collection.find().toArray())
  } finally {
    await mongoClient.close();
  }
})

app.listen(PORT, () => {
  console.log(`API Server Started at ${PORT}`)
})


// Get hotel by ID
app.get('/hotels/:id', async (req, res) => {
  const hotelId = req.params.id;

  const mongoClient = new MongoClient(DATABASE_URL);

  try {
    await mongoClient.connect();
    const db = mongoClient.db();
    const collection = db.collection('hotels');

    const hotel = await collection.findOne({ _id: new ObjectId(hotelId) });

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.json(hotel);
  } catch (error) {
    console.error("Error fetching hotel by ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await mongoClient.close();
  }
});



