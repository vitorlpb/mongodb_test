//import mysql from 'mysql2';
import { mysqlConnection } from "../db.js";
import { connectMongoDB } from "../db.js";

// Conecta ao MongoDB

const dbname = "employees";
var emp = "";
var offset = 0; 
var hasMoreData = true;
var count = 0;

// Função principal para construir a árvore JSON
const main = async () => {
  try {
    const employees = [];
    const salaries = [];
    const titles = [];
    const deptEmployees = [];
    const deptManager = [];
    const departments = [];
    var employeeTree = [];

    let connection;
    connection = await mysqlConnection();
    while (hasMoreData) {
      const [sal] = await connection.execute(`SELECT * FROM salaries where emp_no = ${10000+offset+1}`);
      salaries.push(sal);
      const [title] = await connection.execute(`SELECT * FROM titles where emp_no = ${10000+offset+1}`);
      titles.push(title);
      const [depEmp] = await connection.execute(`SELECT * FROM dept_emp where emp_no = ${10000+offset+1}`);
      deptEmployees.push(depEmp);

      const deptNos = deptEmployees.flat().map((deptEmp) => deptEmp.dept_no);
      //console.log(deptNos);

      const [depManager] = await connection.execute(`SELECT * FROM dept_manager where emp_no = ${10000+offset+1}`);
      deptManager.push(depManager);    
      for (const deptNo of deptNos) {
        const [dept] = await connection.execute(`SELECT * FROM departments where dept_no = '${deptNo}'`);
        departments.push(dept);
      }
      
      await fetchPaginated('SELECT * FROM employees', (row) => employees.push(row));
    
      //console.log(rows);
      
      employeeTree = await buildEmployeeTree(employees, salaries, titles, deptEmployees, deptManager, departments);
      //return departments;
      count++;
      if (count == 100) {
        count = 0;
        await saveToMongoDB(employeeTree);
      }
    }
    await saveToMongoDB(employeeTree);
    
  } catch (err) {
    console.error("Erro ao construir a árvore de funcionários:", err.message);
    throw err; 
  }
};

// Função para construir a árvore JSON
const buildEmployeeTree = (employees, salaries, titles, deptEmployees, deptManager, departments) => {
  return employees.map((emp) => {
    // Filtra os dados relacionados ao funcionário atual
    const empSalaries = salaries.filter((sal) => sal.emp_no === emp.emp_no);
    const empTitles = titles.filter((title) => title.emp_no === emp.emp_no);
    const empDeptEmployees = deptEmployees.filter((deptEmp) => deptEmp.emp_no === emp.emp_no);
    const empDeptManager = deptManager.filter((deptMan) => deptMan.emp_no === emp.emp_no);
    const empDepartments = empDeptEmployees.map((deptEmp) =>
      departments.find((dept) => dept.dept_no === deptEmp.dept_no)
    );

    // Retorna a estrutura JSON para o funcionário
    return {
      emp_no: emp.emp_no,
      birth_date: emp.birth_date,
      first_name: emp.first_name,
      last_name: emp.last_name,
      gender: emp.gender,
      hire_date: emp.hire_date,
      salaries: empSalaries.map((sal) => ({
        emp_no: sal.emp_no,
        salary: sal.salary,
        from_date: sal.from_date,
        to_date: sal.to_date,
      })),
      titles: empTitles.map((title) => ({
        emp_no: title.emp_no,
        title: title.title,
        from_date: title.from_date,
        to_date: title.to_date,
      })),
      dept_manager: empDeptManager.map((deptMan) => ({
        emp_no: deptMan.emp_no,
        dept_no: deptMan.dept_no,
        from_date: deptMan.from_date,
        to_date: deptMan.to_date,
      })),
      dept_emp: empDeptEmployees.map((deptEmp) => ({
        emp_no: deptEmp.emp_no,
        dept_no: deptEmp.dept_no,
        from_date: deptEmp.from_date,
        to_date: deptEmp.to_date,
      })),
      departments: empDepartments.map((dept) => ({
        dept_no: dept.dept_no,
        dept_name: dept.dept_name,
      })),
    };
  });
};

const fetchPaginated = async (query, processRow, pageSize = 1) => {

  let connection;
  try {
    connection = await mysqlConnection();

    if (hasMoreData) {
      const paginatedQuery = `${query} LIMIT ${pageSize} OFFSET ${offset}`;
      // const paginatedQuery = `${query} LIMIT ${pageSize} OFFSET ${offset}`;
      console.log(`Executando consulta: ${paginatedQuery}`);

      const [rows] = await connection.query(paginatedQuery);

      if (rows.length > 0) {
        rows.forEach(processRow); // Processa cada linha individualmente
        offset += pageSize; // Incrementa o offset para a próxima página
      } else {
        hasMoreData = false; // Não há mais dados para buscar
      }
    }
  } catch (err) {
    console.error(`Erro ao executar a consulta paginada: ${query}`, err.message);
    throw err;
  } finally {
    if (connection) {
      await connection.end();
      console.log("Conexão com o MySQL encerrada.");
    }
  }
};

const saveToMongoDB = async (data) => {
  let db;
  try{
    db = await connectMongoDB();
    const collection = db.collection(dbname);
    
    await collection.insertMany(data);
  }catch(err){
    console.error("Erro ao salvar no MongoDB:", err.message);
  }
};

export { main };



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
