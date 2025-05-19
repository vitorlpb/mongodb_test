import { mysqlConnection } from "../db.js";
import { connectMongoDB } from "../db.js";
import { createIndexes } from "../db.js";
import { employeeFindLast } from "./employeesFindAll.js";

const db = await connectMongoDB();
const collection = db.collection("employee");
await createIndexes(collection);

const main = async () => {
  const lastEmployee = await employeeFindLast();
  var offset = 0;
  if (lastEmployee.length > 0) {
    offset = lastEmployee[0].emp_no - 10000;
  } else {
    offset = 0;
  }

  var hasMoreData = true;
  var count = 0;
  var countLimit = 0;

  try {
    const employees = [];
    const employeeTree = [];
    let connection = await mysqlConnection();
    while (hasMoreData) {
      const [employee] = await connection.execute(`SELECT * FROM employees WHERE emp_no > ${10000 + offset} limit 1`);
      if (employee.length === 0 || countLimit > 10000) {
        hasMoreData = false;
        break;
      }
      employees.push(employee[0]);
      const [salaries] = await connection.execute(`SELECT * FROM salaries WHERE emp_no = ${10000 + offset + 1}`);
      const [titles] = await connection.execute(`SELECT * FROM titles WHERE emp_no = ${10000 + offset + 1}`);
      const [deptEmployees] = await connection.execute(`SELECT * FROM dept_emp WHERE emp_no = ${10000 + offset + 1}`);
      const deptNos = deptEmployees.map((deptEmp) => deptEmp.dept_no);
      const [deptManager] = await connection.execute(`SELECT * FROM dept_manager WHERE emp_no = ${10000 + offset + 1}`);
      const departments = [];
      for (const deptNo of deptNos) {
        const [dept] = await connection.execute(`SELECT * FROM departments WHERE dept_no = '${deptNo}'`);
        if (dept.length > 0) {
          departments.push(dept[0]);
        }
      }

      const employeeData = buildEmployeeTree(
        employee[0],
        salaries,
        titles,
        deptEmployees,
        deptManager,
        departments
      );
      employeeTree.push(employeeData);

      offset++;
      countLimit++;
      count++;
      if (count === 1000) {
        await saveToMongoDB(employeeTree);
        console.log(`Inserted ${offset} employees`);
        employeeTree.length = 0;
        count = 0;
      }
    }

    if (employeeTree.length > 0) {
      await saveToMongoDB(employeeTree);
    }

    return employees;
  } catch (err) {
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
      const bulkOps = data.map((doc) => ({
        insertOne: { document: doc },
      }));
      await collection.bulkWrite(bulkOps, { ordered: false });
    }
  } catch (err) {
    throw err;
  }
};


export default main;