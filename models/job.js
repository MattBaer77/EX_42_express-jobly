"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle }
   *
   * Throws BadRequestError if job already in database.
   * */

  static async create({ title, salary, equity, company_handle }) {

    const result = await db.query(
          `INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
        [
          title,
          salary,
          equity,
          company_handle,
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, company_handle }, ...]
   * */

  static async findAll() {
    const jobsRes = await db.query(
        `SELECT id,
            title,
            salary,
            equity,
            company_handle AS "companyHandle"
            FROM jobs
            ORDER BY id;`
        );
    return jobsRes.rows;
  }

// FILTERS FOR
// TITLE, minSalary, hasEquity

//   // 

//   /** Finds jobs filtered by title, minSalary, hasEquity and any combination of the 3.
//    *
//    * Returns [{ title, salary, equity, company_handle }, ...]
//    * */

  static async findFilter(data) {

    console.log(data)

    let filterSQL = '';

    if (data.title) {
      console.log('Title Included')
      filterSQL += ` AND LOWER(title) LIKE '%${data.title}%'`
    }

    if (data.salary) {
      console.log('Salary included')
      filterSQL += ` AND salary >= ${data.salary}`
    }

    if (data.hasEquity) {
      console.log('Equity included')
      filterSQL += ` AND equity > 0`
    }

    const reformatFilterSQL = filterSQL.slice(5)

    console.log(reformatFilterSQL)

    const filterJobsRes = await db.query(
      `SELECT id,
              title,
              salary,
              equity,
              company_handle AS "companyHandle"
              FROM jobs
              WHERE ${reformatFilterSQL}
              ORDER BY id;`
    )

    return filterJobsRes.rows

  }








//   // 

//   /** Finds companies filtered by nameLike + minEmployees + maxEmployees.
//    *
//    * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
//    * */

//   static async findAllFilter(data) {

//     console.log(data)

//     const {nameLike, minEmployees, maxEmployees} = data

//     const nameLikeWildcard = "%"+nameLike+"%"

//     console.log(nameLike)
//     console.log(nameLikeWildcard)
//     console.log(minEmployees)
//     console.log(maxEmployees)

//     const companiesRes = await db.query(
//             `SELECT handle,
//                     name,
//                     description,
//                     num_employees AS "numEmployees",
//                     logo_url AS "logoUrl"
//             FROM companies
//             WHERE LOWER(name) LIKE $1
//             AND num_employees >= $2
//             AND num_employees <= $3
//             ORDER BY name;`,
//             [nameLikeWildcard, minEmployees, maxEmployees]);
//     return companiesRes.rows;
//   }


//   /** Finds companies filtered by nameLike ONLY.
//    *
//    * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
//    * */

//   static async findNameLikeOnly(data) {

//     console.log(data)

//     const {nameLike} = data

//     const nameLikeWildcard = "%"+nameLike+"%"

//     console.log(nameLike)
//     console.log(nameLikeWildcard)

//     const companiesRes = await db.query(
//             `SELECT handle,
//                     name,
//                     description,
//                     num_employees AS "numEmployees",
//                     logo_url AS "logoUrl"
//             FROM companies
//             WHERE LOWER(name) LIKE $1
//             ORDER BY name;`,
//             [nameLikeWildcard]);
//     return companiesRes.rows;
//   }


//   /** Finds companies filtered by maxEmployees ONLY.
//    *
//    * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
//    * */

//   static async findMaxEmployeesOnly(data) {

//     console.log(data)

//     const {maxEmployees} = data

//     console.log(maxEmployees)

//     const companiesRes = await db.query(
//             `SELECT handle,
//                     name,
//                     description,
//                     num_employees AS "numEmployees",
//                     logo_url AS "logoUrl"
//             FROM companies
//             WHERE num_employees <= $1
//             ORDER BY name;`,
//             [maxEmployees]);
//     return companiesRes.rows;
//   }


//   /** Finds companies filtered by minEmployees ONLY.
//    *
//    * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
//    * */

//   static async findMinEmployeesOnly(data) {

//     console.log(data)

//     const {minEmployees} = data

//     console.log(minEmployees)

//     const companiesRes = await db.query(
//             `SELECT handle,
//                     name,
//                     description,
//                     num_employees AS "numEmployees",
//                     logo_url AS "logoUrl"
//             FROM companies
//             WHERE num_employees >= $1
//             ORDER BY name;`,
//             [minEmployees]);
//     return companiesRes.rows;
//   }


//   /** Finds companies filtered by nameLike + minEmployees.
//    *
//    * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
//    * */

//   static async findNameLikeMinEmployees(data) {

//     console.log(data)

//     const {nameLike, minEmployees} = data

//     const nameLikeWildcard = "%"+nameLike+"%"

//     console.log(nameLike)
//     console.log(nameLikeWildcard)
//     console.log(minEmployees)

//     const companiesRes = await db.query(
//             `SELECT handle,
//                     name,
//                     description,
//                     num_employees AS "numEmployees",
//                     logo_url AS "logoUrl"
//             FROM companies
//             WHERE LOWER(name) LIKE $1
//             AND num_employees >= $2
//             ORDER BY name;`,
//             [nameLikeWildcard, minEmployees]);
//     return companiesRes.rows;
//   }


//   /** Finds companies filtered by nameLike + maxEmployees.
//    *
//    * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
//    * */

//   static async findNameLikeMaxEmployees(data) {

//     console.log(data)

//     const {nameLike, maxEmployees} = data

//     const nameLikeWildcard = "%"+nameLike+"%"

//     console.log(nameLike)
//     console.log(nameLikeWildcard)
//     console.log(maxEmployees)

//     const companiesRes = await db.query(
//             `SELECT handle,
//                     name,
//                     description,
//                     num_employees AS "numEmployees",
//                     logo_url AS "logoUrl"
//             FROM companies
//             WHERE LOWER(name) LIKE $1
//             AND num_employees <= $2
//             ORDER BY name;`,
//             [nameLikeWildcard, maxEmployees]);
//     return companiesRes.rows;
//   }


//   /** Finds companies filtered by minEmployees + maxEmployees.
//    *
//    * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
//    * */

//   static async findMinMaxEmployees(data) {

//     console.log(data)

//     const {minEmployees, maxEmployees} = data

//     console.log(minEmployees)
//     console.log(maxEmployees)

//     const companiesRes = await db.query(
//             `SELECT handle,
//                     name,
//                     description,
//                     num_employees AS "numEmployees",
//                     logo_url AS "logoUrl"
//             FROM companies
//             WHERE num_employees >= $1
//             AND num_employees <= $2
//             ORDER BY name;`,
//             [minEmployees, maxEmployees]);
//     return companiesRes.rows;
//   }
  

//   // 

//   /** Given a company handle, return data about company.
//    *
//    * Returns { handle, name, description, numEmployees, logoUrl, jobs }
//    *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
//    *
//    * Throws NotFoundError if not found.
//    **/

//   static async get(handle) {
//     const companyRes = await db.query(
//           `SELECT handle,
//                   name,
//                   description,
//                   num_employees AS "numEmployees",
//                   logo_url AS "logoUrl"
//            FROM companies
//            WHERE handle = $1`,
//         [handle]);

//     const company = companyRes.rows[0];

//     if (!company) throw new NotFoundError(`No company: ${handle}`);

//     return company;
//   }

//   /** Update company data with `data`.
//    *
//    * This is a "partial update" --- it's fine if data doesn't contain all the
//    * fields; this only changes provided ones.
//    *
//    * Data can include: {name, description, numEmployees, logoUrl}
//    *
//    * Returns {handle, name, description, numEmployees, logoUrl}
//    *
//    * Throws NotFoundError if not found.
//    */

//   static async update(handle, data) {
//     const { setCols, values } = sqlForPartialUpdate(
//         data,
//         {
//           numEmployees: "num_employees",
//           logoUrl: "logo_url",
//         });
//     const handleVarIdx = "$" + (values.length + 1);

//     const querySql = `UPDATE companies 
//                       SET ${setCols} 
//                       WHERE handle = ${handleVarIdx} 
//                       RETURNING handle, 
//                                 name, 
//                                 description, 
//                                 num_employees AS "numEmployees", 
//                                 logo_url AS "logoUrl"`;
//     const result = await db.query(querySql, [...values, handle]);
//     const company = result.rows[0];

//     if (!company) throw new NotFoundError(`No company: ${handle}`);

//     return company;
//   }

//   /** Delete given company from database; returns undefined.
//    *
//    * Throws NotFoundError if company not found.
//    **/

//   static async remove(handle) {
//     const result = await db.query(
//           `DELETE
//            FROM companies
//            WHERE handle = $1
//            RETURNING handle`,
//         [handle]);
//     const company = result.rows[0];

//     if (!company) throw new NotFoundError(`No company: ${handle}`);
//   }
}


module.exports = Job;
