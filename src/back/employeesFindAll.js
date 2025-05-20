import { connectMongoDB } from "../db.js";

const employeesFindAll = async () => {
  const db = await connectMongoDB();
  const collection = db.collection("employee");
  const employees = await collection.find({}).limit(100).toArray();
  return employees;
};

const employeeFindLast = async () => {
  const db = await connectMongoDB();
  const collection = db.collection("employee");
  const employees = await collection.find({}).sort({ emp_no: -1 }).limit(1).toArray();
  return employees;
};

const employeeFindByNameAndLastName = async (name) => {
  const db = await connectMongoDB();
  const collection = db.collection("employee");
  const { firstPart, lastPart } = formatTwoPartsString(name);
  if(firstPart || lastPart) {
    const employees = await collection.find({ first_name: firstPart, last_name: lastPart }).toArray();  
    return employees;
  }
  const employees = await collection.find({ first_name: {$regex: firstPart}, last_name: {$regex: lastPart} }).toArray(); //$regex
  if (employees.length === 0) {
    const employees = await collection.find({last_name: {$regex: firstPart} }).toArray();
    return employees;
  }else {
    return employees;
  }
};

const employeeFindById = async (emp_no) => {
  const db = await connectMongoDB();
  const collection = db.collection("employee");
  const employees = await collection.find({ emp_no: parseInt(emp_no) }).toArray();
  return employees;
};

const employeeFindByTitle = async (title) => {
  const db = await connectMongoDB();
  const collection = db.collection("employee");
  const { firstPart, lastPart } = formatTwoPartsString(title);
  const formatedTitle = `${firstPart} ${lastPart}`;
  const employees = await collection.find({
    "titles.title": { $regex: formatedTitle.trim() }
  }).toArray();
  return employees;
};

const employeeFindByDepartment = async (department) => {
  const db = await connectMongoDB();
  const collection = db.collection("employee");
  const { firstPart, lastPart } = formatTwoPartsString(department);
  const formatedDepartment = `${firstPart} ${lastPart}`;
  const employees = await collection.find({
    "departments.dept_name": formatedDepartment.trim()
  }).toArray();
  return employees;
};

const allEmployeesAvaregeSalaryByDepartment = async () => {
  const db = await connectMongoDB();
  const collection = db.collection("employee");
  const result = await collection.aggregate([
    { $unwind: "$departments" },
    { $unwind: "$salaries" },
    {
      $group: {
        _id: "$departments.dept_name",
        averageSalary: { $avg: "$salaries.salary" }
      }
    },
    {
      $project: {
        _id: 0,
        department: "$_id",
        averageSalary: { $round: ["$averageSalary", 2] }
      }
    }
  ]).toArray();
  return result;
};

const employeesFindAllByManager = async (manager) => {
  const db = await connectMongoDB();
  const collection = db.collection("employee");
  let managerData;
  if (isNaN(manager)) {
    const {firstPart, lastPart} = formatTwoPartsString(manager);
    managerData = await employeeFindByNameAndLastName(firstPart, lastPart);
  } else {
    managerData = await employeeFindById(parseInt(manager));
  }

  if (managerData.length === 0) {
    return [];
  }

  const possibleManagers = managerData.filter((employee) => employee.dept_manager && employee.dept_manager.length > 0);
  if (possibleManagers.length === 0) {
    return []; // Nenhum gerente encontrado
  }
  const managerInfo = possibleManagers[0];
  const { dept_manager } = managerInfo;
  if (!dept_manager || dept_manager.length === 0) {
    return [];
  }

  const {
    dept_no,
    from_date: managerFromDate,
    to_date: managerToDate
  } = dept_manager[0];

  const employees = await collection.find({
    "dept_emp.dept_no": dept_no,
    $and: [
      { "dept_emp.from_date": { $lte: managerToDate } },
      { "dept_emp.to_date": { $gte: managerFromDate } }
    ]
  })
  .limit(10)
  .toArray();

  return employees;
};

const formatTwoPartsString = (twoPartsString) => {
  const trimmedString = twoPartsString.trim().replace(/\s+/g, " ");
  const [firstPart, ...lastPart] = trimmedString.split(" ");
  // const [firstPart, lastPart] = trimmedString.split(" ");
  const formattedFirstPart = firstPart.charAt(0).toUpperCase() + firstPart.slice(1).toLowerCase();
  //const formattedLastPart = lastPart.charAt(0).toUpperCase() + lastPart.slice(1).toLowerCase();
  const formattedLastPart = lastPart
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
  return { firstPart: formattedFirstPart, lastPart: formattedLastPart };
};

export {
  employeesFindAll,
  employeeFindLast,
  employeeFindById,
  employeeFindByNameAndLastName,
  employeesFindAllByManager,
  employeeFindByTitle,
  employeeFindByDepartment,
  allEmployeesAvaregeSalaryByDepartment
};