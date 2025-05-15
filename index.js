//packge.json (type: module) substitui .mjs
import express from 'express';
import {  connectMongoDB, mysqlConnection } from './db.js';
import { main } from './back/employeesCollection.js';
import { employeesFindAll } from './back/employeesFindAll.js';

//await mysqlConnection();

const app = express();
await connectMongoDB();
app.use(express.json());
app.get('/get', async (req, res) => { 
  try {
    const employees = await employeesFindAll();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal Server Error', error });
  }
});

app.get('/emp', async (req, res) => {
  try {
    const employees = await main();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal Server Error', error });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
