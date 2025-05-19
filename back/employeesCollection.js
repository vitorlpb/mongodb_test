import e from "express";
import { mysqlConnection } from "../db.js";
import { connectMongoDB } from "../db.js";
import { employeeFindLast } from "./employeesFindAll.js";

const lastEmployee = await employeeFindLast();
var offset = 0;
if(lastEmployee.length > 0){
  offset = (lastEmployee[0].emp_no - 10000);
}else{
  offset = 0;
}

var hasMoreData = true;
var count = 0;
const db = await connectMongoDB();
const collection = db.collection("employee");

const main = async () => {
  try {
    const employees = [];
    const employeeTree = [];
    let connection = await mysqlConnection();
    while (hasMoreData) {
      const [employee] = await connection.execute(`SELECT * FROM employees WHERE emp_no = ${10000 + offset + 1} and `);
      // console.log("select employees");
      if (employee.length === 0) {
        hasMoreData = false;
        break;
      }
      employees.push(employee[0]);
      // console.log("employee push");
      const [salaries] = await connection.execute(`SELECT * FROM salaries WHERE emp_no = ${10000 + offset + 1}`);
      // console.log("select salaries");
      const [titles] = await connection.execute(`SELECT * FROM titles WHERE emp_no = ${10000 + offset + 1}`);
      // console.log("select titles");
      const [deptEmployees] = await connection.execute(`SELECT * FROM dept_emp WHERE emp_no = ${10000 + offset + 1}`);
      // console.log("select dept_emp");
      const deptNos = deptEmployees.map((deptEmp) => deptEmp.dept_no);
      // console.log("map dept_emp");
      
      const [deptManager] = await connection.execute(`SELECT * FROM dept_manager WHERE emp_no = ${10000 + offset + 1}`);
      // console.log("select dept_manager");
      const departments = [];
      for (const deptNo of deptNos) {
        const [dept] = await connection.execute(`SELECT * FROM departments WHERE dept_no = '${deptNo}'`);
        // console.log("select departments");
        if (dept.length > 0) {
          departments.push(dept[0]);
        }
      }
      // console.log("departments for end");
      

      const employeeData = buildEmployeeTree(
        employee[0],
        salaries,
        titles,
        deptEmployees,
        deptManager,
        departments
      );
      // console.log("buildEmployeeTree");
      employeeTree.push(employeeData);
      // console.log("employeeTree push");
      
      offset++;

      // Salva no MongoDB a cada 10 funcionários processados
      count++;
      if (count === 1) {
        await saveToMongoDB(employeeTree); // demora muito
        // console.log("Salvo no MongoDB");
        console.log(offset);
        employeeTree.length = 0; // Limpa o array para a próxima iteração
        count = 0;
      }
    }
    // console.log("while end");
      
    if (employeeTree.length > 0) {
      await saveToMongoDB(employeeTree);
      // console.log("Salvo no MongoDB if > 0");
    }

    return employees;
  } catch (err) {
    console.error("Erro ao construir a árvore de funcionários:", err.message);
    throw err;
  }
};

const buildEmployeeTree = (employee, salaries, titles, deptEmployees, deptManager, departments) => {
  return {
    emp_no: employee.emp_no,
    birth_date: employee.birth_date,
    first_name: employee.first_name,
    last_name: employee.last_name,
    gender: employee.gender,
    hire_date: employee.hire_date,
    salaries: salaries.map((sal) => ({
      emp_no: sal.emp_no,
      salary: sal.salary,
      from_date: sal.from_date,
      to_date: sal.to_date,
    })),
    titles: titles.map((title) => ({
      emp_no: title.emp_no,
      title: title.title,
      from_date: title.from_date,
      to_date: title.to_date,
    })),
    dept_manager: deptManager.map((deptMan) => ({
      emp_no: deptMan.emp_no,
      dept_no: deptMan.dept_no,
      from_date: deptMan.from_date,
      to_date: deptMan.to_date,
    })),
    dept_emp: deptEmployees.map((deptEmp) => ({
      emp_no: deptEmp.emp_no,
      dept_no: deptEmp.dept_no,
      from_date: deptEmp.from_date,
      to_date: deptEmp.to_date,
    })),
    departments: departments.map((dept) => ({
      dept_no: dept.dept_no,
      dept_name: dept.dept_name,
    })),
  };
};

const saveToMongoDB = async (data) => {
  try {
    if (data.length > 0) {
      // Cria as operações de inserção para o bulkWrite
      const bulkOps = data.map((doc) => ({
        insertOne: { document: doc },
      }));

      // Executa o bulkWrite
      await collection.bulkWrite(bulkOps, { ordered: false }); // `ordered: false` continua mesmo se houver falhas
      console.log("Dados salvos no MongoDB com sucesso usando bulkWrite!");
    }
  } catch (err) {
    console.error("Erro ao salvar no MongoDB com bulkWrite:", err.message);
    throw err;
  }
};

// const saveToMongoDB = async (data) => {
//   try {
//     await collection.insertMany(data);
//     // console.log("Dados salvos no MongoDB com sucesso!");
//   } catch (err) {
//     console.error("Erro ao salvar no MongoDB:", err.message);
//     throw err;
//   }
// };

export { main };


// const fetchPaginated = async (query, processRow, pageSize = 1) => {

//   let connection;
//   try {
//     connection = await mysqlConnection();

//     if (hasMoreData) {
//       const paginatedQuery = `${query} LIMIT ${pageSize} OFFSET ${offset}`;
//       // const paginatedQuery = `${query} LIMIT ${pageSize} OFFSET ${offset}`;
//       console.log(`Executando consulta: ${paginatedQuery}`);

//       const [rows] = await connection.query(paginatedQuery);

//       if (rows.length > 0) {
//         rows.forEach(processRow); // Processa cada linha individualmente
//         offset += pageSize; // Incrementa o offset para a próxima página
//       } else {
//         hasMoreData = false; // Não há mais dados para buscar
//       }
//     }
//   } catch (err) {
//     console.error(`Erro ao executar a consulta paginada: ${query}`, err.message);
//     throw err;
//   } finally {
//     if (connection) {
//       await connection.end();
//       console.log("Conexão com o MySQL encerrada.");
//     }
//   }
// };


// // Função genérica para buscar dados usando streaming
// const fetchStream = async (query, processRow) => {
//   let connection;
//   connection = await mysqlConnection();

//   return new Promise((resolve, reject) => {
//     const stream = connection.query(query).stream();

//     stream.on('data', (row) => {
//       processRow(row); // Processa cada linha individualmente
//     });

//     stream.on('end', () => {
//       console.log(`Streaming concluído para a consulta: ${query}`);
//       connection.end();
//       resolve();
//     });

//     stream.on('error', (err) => {
//       console.error(`Erro no streaming para a consulta: ${query}`, err.message);
//       connection.end();
//       reject(err);
//     });
//   });
// };
