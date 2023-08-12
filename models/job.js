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

//   /** Given a job id, return data about job.
//    *
//    * Returns { title, salary, equity, company_handle }
//    *
//    * Throws NotFoundError if not found.
//    **/

  // static async get(handle) {
  //   const jobRes = await db.query(
  //         `SELECT handle,
  //                 name,
  //                 description,
  //                 num_employees AS "numEmployees",
  //                 logo_url AS "logoUrl"
  //          FROM companies
  //          WHERE handle = $1`,
  //       [handle]);

  //   const company = companyRes.rows[0];

  //   if (!company) throw new NotFoundError(`No company: ${handle}`);

  //   return company;
  // }

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
