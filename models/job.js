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
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws BadRequestError if job already in database.
   * */

  static async create({ title, salary, equity, companyHandle }) {

    const existingCompanyCheck = await db.query(
      `SELECT handle
       FROM companies
       WHERE handle = $1`,
    [companyHandle]);

    if (!existingCompanyCheck.rows[0])
      throw new BadRequestError(`No Company: ${companyHandle}`);

    const result = await db.query(
          `INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
        [
          title,
          salary,
          equity,
          companyHandle,
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, company_handle }, ...]
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

  /** Finds jobs filtered by title, minSalary, hasEquity and any combination of the 3.
   *
   * Returns [{ id, title, salary, equity, company_handle }, ...]
   * */

  static async findFilter(data) {

    console.log(data)

    let filterSQL = '';
    let filterParams = []
    let idx = 1

    if (data.title) {
      console.log('Title Included')
      filterSQL += ` AND LOWER(title) LIKE $${idx}`
      idx += 1
      const titleWildcard = "%"+data.title+"%"
      filterParams.push(titleWildcard)
    }

    if (data.minSalary) {
      console.log('Salary included')
      filterSQL += ` AND salary >= $${idx}`
      filterParams.push(data.minSalary)
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
              ORDER BY id;`,
              filterParams
    )

    return filterJobsRes.rows

  }
  
  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
      `SELECT id,
              title,
              salary,
              equity,
              company_handle AS "companyHandle"
              FROM jobs
              WHERE id = $1`,
              [id]
      );

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});

    if (data.companyHandle) throw new BadRequestError(`Cannot Change companyHandle to ${data.companyHandle} Remove companyHandle from request data.`)

    console.log(data)
    console.log(setCols)
    console.log(values)
    
    const handleVarIdx = "$" + (values.length + 1);

    console.log(handleVarIdx)

    const querySql = `UPDATE jobs
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    console.log(job)

    if (!job) throw new NotFoundError(`No company: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No company: ${id}`);
  }
}


module.exports = Job;
