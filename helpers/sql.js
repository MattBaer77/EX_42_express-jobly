const { BadRequestError } = require("../expressError");

/** Helper: SQL for Partial Update
 * 
 * Accepts an object of dataToUpdate - JSON data to convert to SQL
 * Accepts an object of jsToSql - an object with identical keys as dataToUpdate and the SQL version of the corresponding keys.
 * 
 * dataToUpdate is converted from JSON format object to an object containing "setCols" and "values" and returned.
 * 
 * "setCols" is a string of the values from jsToSql with the same key as each key in dataToUpdate (or the corresponding key from dataToUpdate if no matching key exists in jsToSql) with "=$" and an index for each value counting from 1 appended.
 * 
 * "values" is an array of the values in dataToUpdate.
 * 
 * NOTE: If jsToSql not provided for a key in dataToUpdate, then function will replace this value with the key from dataToUpdate.
 * 
 * Example:
 * ({firstName: "Michael", lastName: "Jordan"}, {firstName: "first_name"}) => { setCols: '"first_name"=$1, "lastName"=$2', values: ['Michael', 'Jordan'] }
 * 
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {

  // {firstName: 'Aliya', age: 32} => ["firstName", "age"]
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // ["firstName", "age"] => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
      // first_name || firstName (if jsToSql.firstName does not exist)
  );

  return {

    // ['"first_name"=$1', '"age"=$2'] => '"first_name"=$1, "age"=$2'
    setCols: cols.join(", "),

    // {firstName: 'Aliya', age: 32} => ['Aliya','32']
    values: Object.values(dataToUpdate),

  };
  
}

module.exports = { sqlForPartialUpdate };
