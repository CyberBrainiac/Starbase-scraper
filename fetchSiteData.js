import axios from "axios";

export default async function fetchData(url, method) {
  console.log(`Fetching Data from ${url}...`);
  try {
    const response = await axios[method](url);
    const data = response.data;
    return data;
  } catch (error) {
    throw new Error("Erorr fetching data", error);
  }
}
