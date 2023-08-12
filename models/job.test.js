"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
    const newJob = {
      title: "c1 Job",
      salary: 1,
      equity: 0.1,
      company_handle: 'c1',
    };
  
    test("works", async function () {
        let job = await Job.create(newJob);

        expect(job.title).toEqual(newJob.title);
        expect(job.salary).toEqual(newJob.salary);
        expect(parseFloat(job.equity)).toEqual(newJob.equity);
        expect(job.companyHandle).toEqual(newJob.company_handle);

        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
                FROM jobs
                WHERE id = ${job.id}`);
        expect(result.rows).toEqual([
        {
            id: job.id,
            title: "c1 Job",
            salary: 1,
            equity: '0.1',
            company_handle: 'c1'
        },
        ]);
    });
  
    test("can create duplicate", async function () {

        let job = await Job.create(newJob);

        expect(job.title).toEqual(newJob.title);
        expect(job.salary).toEqual(newJob.salary);
        expect(parseFloat(job.equity)).toEqual(newJob.equity);
        expect(job.companyHandle).toEqual(newJob.company_handle);

        const result = await db.query(
                `SELECT id, title, salary, equity, company_handle AS "companyHandle"
                FROM jobs
                WHERE id = ${job.id}`);

        expect(result.rows).toEqual([
        {
            id: job.id,
            title: "c1 Job",
            salary: 1,
            equity: '0.1',
            companyHandle: 'c1'
        },
        ]);

    });
  
    test("can create duplicate - NO EQUITY", async function () {

        const newJobNoEquity = {
            title: "c1 Job",
            salary: 1,
            company_handle: 'c1',
          };

        let job = await Job.create(newJobNoEquity);

        expect(job.title).toEqual(newJobNoEquity.title);
        expect(job.salary).toEqual(newJobNoEquity.salary);
        expect(job.equity).toEqual(null);
        expect(job.companyHandle).toEqual(newJobNoEquity.company_handle);

        const result = await db.query(
                `SELECT id, title, salary, equity, company_handle AS "companyHandle"
                FROM jobs
                WHERE id = ${job.id}`);

        expect(result.rows).toEqual([
        {
            id: job.id,
            title: "c1 Job",
            salary: 1,
            equity: null,
            companyHandle: 'c1'
        },
        ]);

    });
});
  
/************************************** findAll */
  
describe("findAll", function () {

    test("works: no filters", async function () {

        let jobs = await Job.findAll();
        expect(jobs).toEqual([
        {
            id: 1,
            title: "seed c1 job1",
            salary: 1,
            equity: '0.1',
            companyHandle: 'c1'
        },
        {
            id: 2,
            title: "seed c1 job2",
            salary: 2,
            equity: '0.2',
            companyHandle: 'c1'
        },
        {
            id: 3,
            title: "seed c2 job",
            salary: 3,
            equity: '0.3',
            companyHandle: 'c2'
        },
        {
            id: 4,
            title: "seed c3 job NO EQUITY",
            salary: 4,
            equity: null,
            companyHandle: 'c3'
        }
        ]);
    });
});

/************************************** findFilter */

describe("findFilter", function () {

    test("filter works - TITLE", async function() {

        let filterData = {
            title: 'c1'
        }

        let filteredJob = await Job.findFilter(filterData)

        expect(filteredJob).toEqual([
            {
                id: 1,
                title: "seed c1 job1",
                salary: 1,
                equity: '0.1',
                companyHandle: 'c1'
            },
            {
                id: 2,
                title: "seed c1 job2",
                salary: 2,
                equity: '0.2',
                companyHandle: 'c1'
            }
        ])

    })

    test("filter works - SALARY", async function() {

        let filterData = {
            salary: 2
        }

        let filteredJob = await Job.findFilter(filterData)

        expect(filteredJob).toEqual([
            {
              id: 2,
              title: 'seed c1 job2',
              salary: 2,
              equity: '0.2',
              companyHandle: 'c1'
            },
            {
              id: 3,
              title: 'seed c2 job',
              salary: 3,
              equity: '0.3',
              companyHandle: 'c2'
            },
            {
              id: 4,
              title: 'seed c3 job NO EQUITY',
              salary: 4,
              equity: null,
              companyHandle: 'c3'
            }
        ])

    })

    test("filter works - EQUITY", async function() {

        let filterData = {
            hasEquity: true
        }

        let filteredJob = await Job.findFilter(filterData)

        expect(filteredJob).toEqual([
            {
                id: 1,
                title: "seed c1 job1",
                salary: 1,
                equity: '0.1',
                companyHandle: 'c1'
            },
            {
                id: 2,
                title: "seed c1 job2",
                salary: 2,
                equity: '0.2',
                companyHandle: 'c1'
            },
            {
                id: 3,
                title: "seed c2 job",
                salary: 3,
                equity: '0.3',
                companyHandle: 'c2'
            }
        ])

    })

    test("filter works - TITLE + SALARY", async function() {

        let filterData = {
            title: 'c1',
            salary: 2
        }

        let filteredJob = await Job.findFilter(filterData)

        expect(filteredJob).toEqual([
            
            {
                id: 2,
                title: "seed c1 job2",
                salary: 2,
                equity: '0.2',
                companyHandle: 'c1'
            }

        ])

    })

    test("filter works - TITLE + EQUITY", async function() {

        let filterData = {
            title: 'c3',
            hasEquity: true
        }

        let filteredJob = await Job.findFilter(filterData)

        expect(filteredJob).toEqual([])

    })

    test("filter works - SALARY + EQUITY", async function() {

        let filterData = {
            salary: 3,
            hasEquity: true
        }

        let filteredJob = await Job.findFilter(filterData)

        expect(filteredJob).toEqual([
            {
                id: 3,
                title: 'seed c2 job',
                salary: 3,
                equity: '0.3',
                companyHandle: 'c2'
            }
        ])

    })

    test("filter works - TITLE + SALARY + EQUITY", async function() {

        let filterData = {
            title: "c1",
            salary: 2,
            hasEquity: true
        }

        let filteredJob = await Job.findFilter(filterData)

        expect(filteredJob).toEqual([
            {
                id: 2,
                title: "seed c1 job2",
                salary: 2,
                equity: '0.2',
                companyHandle: 'c1'
            },
        ])

    })
 
});

/************************************** get */

describe("get", function () {
    test("works", async function () {
      let job = await Job.get(1);
      expect(job).toEqual(
        {
            id: 1,
            title: "seed c1 job1",
            salary: 1,
            equity: '0.1',
            companyHandle: 'c1'
        },
      );
    });
  
    test("not found if no such company", async function () {
      try {
        await Job.get(0);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  });

/************************************** update */

// describe("update", function () {
//     const updateData = {
//       name: "New",
//       description: "New Description",
//       numEmployees: 10,
//       logoUrl: "http://new.img",
//     };
  
//     test("works", async function () {
//       let company = await Company.update("c1", updateData);
//       expect(company).toEqual({
//         handle: "c1",
//         ...updateData,
//       });
  
//       const result = await db.query(
//             `SELECT handle, name, description, num_employees, logo_url
//              FROM companies
//              WHERE handle = 'c1'`);
//       expect(result.rows).toEqual([{
//         handle: "c1",
//         name: "New",
//         description: "New Description",
//         num_employees: 10,
//         logo_url: "http://new.img",
//       }]);
//     });
  
//     test("works: null fields", async function () {
//       const updateDataSetNulls = {
//         name: "New",
//         description: "New Description",
//         numEmployees: null,
//         logoUrl: null,
//       };
  
//       let company = await Company.update("c1", updateDataSetNulls);
//       expect(company).toEqual({
//         handle: "c1",
//         ...updateDataSetNulls,
//       });
  
//       const result = await db.query(
//             `SELECT handle, name, description, num_employees, logo_url
//              FROM companies
//              WHERE handle = 'c1'`);
//       expect(result.rows).toEqual([{
//         handle: "c1",
//         name: "New",
//         description: "New Description",
//         num_employees: null,
//         logo_url: null,
//       }]);
//     });
  
//     test("not found if no such company", async function () {
//       try {
//         await Company.update("nope", updateData);
//         fail();
//       } catch (err) {
//         expect(err instanceof NotFoundError).toBeTruthy();
//       }
//     });
  
//     test("bad request with no data", async function () {
//       try {
//         await Company.update("c1", {});
//         fail();
//       } catch (err) {
//         expect(err instanceof BadRequestError).toBeTruthy();
//       }
//     });
//   });