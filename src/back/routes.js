import { employeesFindAll, employeeFindLast, employeeFindById, employeeFindByNameAndLastName, employeesFindAllByManager, employeeFindByTitle
        ,employeeFindByDepartment, allEmployeesAvaregeSalaryByDepartment
  } from './employeesFindAll.js';
import main from './employeesCollection.js';

import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

app.get('/emp', async (req, res) => {
  try {
    const employees = await main();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal Server Error', error });
  }
});

app.get('/allEmployeesAvaregeSalaryByDepartment', async (req, res) => {
    try {
        const employees = await allEmployeesAvaregeSalaryByDepartment();
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Internal Server Error', error });
    }
});

app.get('/findByDept/:department', async (req, res) => {
    try {
        const employees = await employeeFindByDepartment(req.params.department);
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Internal Server Error', error });
    }
});

app.get('/findByTitle/:title', async (req, res) => {
    try {
        const employees = await employeeFindByTitle(req.params.title);
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Internal Server Error', error });
    }
});

app.get('/findByName/:name', async (req, res) => {
    try {
        const employees = await employeeFindByNameAndLastName(req.params.name);
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Internal Server Error', error });
    }
});

app.get('/findById/:id', async (req, res) => {
    try {
        const employee = await employeeFindById(req.params.id);
        res.json(employee);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Internal Server Error', error });
    }
});

app.get('/findLast', async (req, res) => {
    try {
        const employee = await employeeFindLast();
        res.json(employee);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Internal Server Error', error });
    }
});

app.get('/findAll', async (req, res) => {
    try {
        const employees = await employeesFindAll();
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Internal Server Error', error });
    }
});

app.get('/findByManager/:manager', async (req, res) => { 
    try {
    const employees = await employeesFindAllByManager(req.params.manager);
    res.json(employees);
    } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal Server Error', error });
    }
});

export default app;