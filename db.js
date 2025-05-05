import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config(); 

const connectDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGO_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      monitorCommands: true,
    });

    console.log("Tentando conectar ao MongoDB...");
    await client.connect();
    console.log("Conexão bem-sucedida!");
    await client.db("admin").command({ ping: 1 });
    console.log("Ping bem-sucedido!");
  
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); 
  }
};

export default connectDB;