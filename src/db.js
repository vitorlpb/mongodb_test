import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config(); 

const connectMongoDB = async () => {
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

    await client.connect();
    // await client.db("admin").command({ ping: 1 });
    return client.db("employees");
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); 
  }
};

const mysqlConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123123',
      database: 'employees',
    });
    console.log("Conexão com o MySQL foi bem-sucedida!");
    return connection;
  } catch (err) {
    console.error('Erro ao conectar ao MySQL:', err.message);
  }
}

const createIndexes = async (collection) => {
  try {
    await collection.createIndex({ emp_no: 1 }, { unique: true }); 
    await collection.createIndex({ "dept_emp.dept_no": 1 }); 
    await collection.createIndex({ "dept_manager.dept_no": 1 }); 
    await collection.createIndex({ "salaries.from_date": 1, "salaries.to_date": 1 }); 
    await collection.createIndex({ "titles.title": 1 }); 
    console.log("Índices criados com sucesso!");
  } catch (err) {
    console.error("Erro ao criar índices:", err);
  }
};

export { 
  connectMongoDB, 
  mysqlConnection,
  createIndexes,
};

