import { connectMongoDB } from "../db.js";

const employeesFindAll = async () => {
  const db = await connectMongoDB();
  const collection = db.collection("employees");
  const employees = await collection.find({}).toArray();
  return employees;
}

export { employeesFindAll };