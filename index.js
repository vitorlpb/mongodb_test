import express from 'express';
import connectDB from './db.js'; // Importing the connectDB function

console.log("Teste de conexão com o MongoDB");
const app = express();

// Connect to MongoDB
connectDB();

// Middleware & routes
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

/*
import { MongoClient, ServerApiVersion } from 'mongodb';
//const uri = "mongodb+srv://testUser:password123123@cluster0.aodnlfy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/sample_mflix";
const uri = "mongodb+srv://testUser:password123123@cluster0.aodnlfy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    connectTimeoutMS: 30000, // Timeout de conexão
    socketTimeoutMS: 30000, // Timeout do socket
    monitorCommands: true,
  });
  async function run() {
    try {
      console.log("Tentando conectar ao MongoDB...");
      await client.connect();
      console.log("Conexão bem-sucedida!");
      await client.db("admin").command({ ping: 1 });
      console.log("Ping bem-sucedido!");
    } catch (error) {
      console.error("Erro ao conectar:", error);
    } finally {
      await client.close();
    }
  }
run().catch(console.dir);
*/