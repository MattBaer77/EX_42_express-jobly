"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {

    title: "c1 Job",
    salary: 1,
    equity: 0.1,
    companyHandle: 'c1'

  };

  const newJobMinRequired = {

    title: "c1 Job",
    companyHandle: 'c1'

  };

  // ANON

  test("FAIL for anon - ANON", async function () {

    const resp = await request(app)
        .post("/companies")
        .send(newJob)
    expect(resp.statusCode).toEqual(401);

  });

  // ADMIN

  test("ok for users - ADMIN", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {

        id: resp.body.job.id,
        title: "c1 Job",
        salary: 1,
        equity: "0.1",
        companyHandle: 'c1'
    
      },
    });
  });

  test("ok for users - SALARY AND EQUITY MISSING - ADMIN", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJobMinRequired)
        .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {

        id: resp.body.job.id,
        title: "c1 Job",
        salary: null,
        equity: null,
        companyHandle: 'c1'
    
      },
    });
  });
  
  test("bad request with missing data - TITLE MISSING - ADMIN", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({

          salary: 1,
          equity: 0.1,
          companyHandle: 'c1'

        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
  
  test("bad request with missing data - TITLE MISSING - ADMIN", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({

          title: "c1 Job",
          salary: 1,
          equity: 0.1,

        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data - ADMIN", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "c1 Job",
          salary: 1,
          equity: 0.1,
          companyHandle: 'not valid company'
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

//   // NOT ADMIN

  test("FAIL for users - NOT ADMIN", async function () {

    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);

  });

  test("bad request with missing data - NOT ADMIN", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({

          title: "c1 Job",
          salary: 1,
          equity: 0.1,

        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with invalid data - NOT ADMIN", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "c1 Job",
          salary: 1,
          equity: 0.1,
          companyHandle: 'not valid company'
        })
    expect(resp.statusCode).toEqual(401);
  });
});

// /************************************** GET /companies */

// describe("GET /jobs", function () {
//   test("ok for anon", async function () {
//     const resp = await request(app).get("/jobs");
//     expect(resp.body).toEqual({
//       jobs:
//           [
//             {
//               id: 1,
//               title: "seed c1 job1",
//               salary: 1,
//               equity: "0.1",
//               companyHandle: 'c1',
//             },
//             {
//               id: 2,
//               title: "seed c1 job2",
//               salary: 2,
//               equity: "0.2",
//               companyHandle: 'c1',
//             },
//             {
//               id: 3,
//               title: "seed c2 job",
//               salary: 3,
//               equity: "0.3",
//               companyHandle: 'c2',
//             },
//             {
//               id: 4,
//               title: "seed c3 job NO EQUITY",
//               salary: 4,
//               equity: null,
//               companyHandle: 'c3',
//             },
//           ],
//     });
//   });

//   test("fails: test next() handler", async function () {
//     // there's no normal failure event which will cause this route to fail ---
//     // thus making it hard to test that the error-handler works with it. This
//     // should cause an error, all right :)
//     await db.query("DROP TABLE jobs CASCADE");
//     const resp = await request(app)
//         .get("/jobs")
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(500);
//   });
// });

// /************************************** GET /companies with filtering */

describe("GET /companies?filters", function () {

  test("ok for anon - filter - Title + minSalary + hasEquity - limited by minSalary and hasEquity", async function () {
    const resp = await request(app).get("/jobs?title=seed&minSalary=3&hasEquity=true");
    expect(resp.body).toEqual(
      {jobs:
        [
          {
            id: 3,
            title: "seed c2 job",
            salary: 3,
            equity: '0.3',
            companyHandle: 'c2',
          },
        ],
      }
    );
  });

//   test("ok for anon - filter - Name + Min + - limited by nameLike", async function () {
//     const resp = await request(app).get("/companies?nameLike=c2&maxEmployees=3&minEmployees=0");
//     expect(resp.body).toEqual(
//       {companies:
//         [
//           {
//             handle: "c2",
//             name: "C2",
//             description: "Desc2",
//             numEmployees: 2,
//             logoUrl: "http://c2.img",
//           },
//         ],
//       }
//     );
//   });

//   test("ok for anon - filter - Name + Min - limited by minEmployees", async function () {
//     const resp = await request(app).get("/companies?nameLike=c&minEmployees=2");
//     expect(resp.body).toEqual(
//       {companies:
//         [
//           {
//             handle: "c2",
//             name: "C2",
//             description: "Desc2",
//             numEmployees: 2,
//             logoUrl: "http://c2.img",
//           },
//           {
//             handle: "c3",
//             name: "C3",
//             description: "Desc3",
//             numEmployees: 3,
//             logoUrl: "http://c3.img",
//           },
//         ],
//       }
//     );
//   });

//   test("ok for anon - filter - Name + Min - limited by nameLike", async function () {
//     const resp = await request(app).get("/companies?nameLike=c2&minEmployees=2");
//     expect(resp.body).toEqual(
//       {companies:
//         [
//           {
//             handle: "c2",
//             name: "C2",
//             description: "Desc2",
//             numEmployees: 2,
//             logoUrl: "http://c2.img",
//           },
//         ],
//       }
//     );
//   });

//   test("ok for anon - filter - Name + Max - limited by maxEmployees", async function () {
//     const resp = await request(app).get("/companies?nameLike=c&maxEmployees=2");
//     expect(resp.body).toEqual(
//       {companies:
//         [
//           {
//             handle: "c1",
//             name: "C1",
//             description: "Desc1",
//             numEmployees: 1,
//             logoUrl: "http://c1.img",
//           },
//           {
//             handle: "c2",
//             name: "C2",
//             description: "Desc2",
//             numEmployees: 2,
//             logoUrl: "http://c2.img",
//           },
//         ],
//       }
//     );
//   });

//   test("ok for anon - filter - Name + Max - limited by nameLike", async function () {
//     const resp = await request(app).get("/companies?nameLike=c2&maxEmployees=2");
//     expect(resp.body).toEqual(
//       {companies:
//         [
//           {
//             handle: "c2",
//             name: "C2",
//             description: "Desc2",
//             numEmployees: 2,
//             logoUrl: "http://c2.img",
//           },
//         ],
//       }
//     );
//   });

//   test("ok for anon - filter - Min ONLY", async function () {
//     const resp = await request(app).get("/companies?minEmployees=2");
//     expect(resp.body).toEqual(
//       {companies:
//         [
//           {
//             handle: "c2",
//             name: "C2",
//             description: "Desc2",
//             numEmployees: 2,
//             logoUrl: "http://c2.img",
//           },
//           {
//             handle: "c3",
//             name: "C3",
//             description: "Desc3",
//             numEmployees: 3,
//             logoUrl: "http://c3.img",
//           },
//         ],
//       }
//     );
//   });

//   test("ok for anon - filter - Max ONLY", async function () {
//     const resp = await request(app).get("/companies?maxEmployees=2");
//     expect(resp.body).toEqual(
//       {companies:
//         [
//           {
//             handle: "c1",
//             name: "C1",
//             description: "Desc1",
//             numEmployees: 1,
//             logoUrl: "http://c1.img",
//           },
//           {
//             handle: "c2",
//             name: "C2",
//             description: "Desc2",
//             numEmployees: 2,
//             logoUrl: "http://c2.img",
//           },
//         ],
//       }
//     );
//   });

//   test("ok for anon - filter - Min + Max", async function () {
//     const resp = await request(app).get("/companies?maxEmployees=2&minEmployees=2");
//     expect(resp.body).toEqual(
//       {companies:
//         [
//           {
//             handle: "c2",
//             name: "C2",
//             description: "Desc2",
//             numEmployees: 2,
//             logoUrl: "http://c2.img",
//           },
//         ],
//       }
//     );
//   });

//   test("ok for anon - filter - Name Only Search", async function () {
//     const resp = await request(app).get("/companies?nameLike=c2");
//     expect(resp.body).toEqual(
//       {companies:
//         [
//           {
//             handle: "c2",
//             name: "C2",
//             description: "Desc2",
//             numEmployees: 2,
//             logoUrl: "http://c2.img",
//           },
//         ],
//       }
//     );
//   });

});

// /************************************** GET /companies/:handle */

// describe("GET /companies/:handle", function () {
//   test("works for anon", async function () {
//     const resp = await request(app).get(`/companies/c1`);
//     expect(resp.body).toEqual({
//       company: {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//     });
//   });

//   test("works for anon: company w/o jobs", async function () {
//     const resp = await request(app).get(`/companies/c2`);
//     expect(resp.body).toEqual({
//       company: {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       },
//     });
//   });

//   test("not found for no such company", async function () {
//     const resp = await request(app).get(`/companies/nope`);
//     expect(resp.statusCode).toEqual(404);
//   });
// });

// /************************************** PATCH /companies/:handle */

// describe("PATCH /companies/:handle", function () {

//   // ANON
//   test("unauth for anon - ANON", async function () {
//     const resp = await request(app)
//         .patch(`/companies/c1`)
//         .send({
//           name: "C1-new",
//         });

//     console.log(resp)

//     expect(resp.statusCode).toEqual(401);
//   });

//   // ADMIN

//   test("works for users - ADMIN", async function () {
//     const resp = await request(app)
//         .patch(`/companies/c1`)
//         .send({
//           name: "C1-new",
//         })
//         .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.body).toEqual({
//       company: {
//         handle: "c1",
//         name: "C1-new",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//     });
//   });

//   test("not found on no such company - ADMIN", async function () {
//     const resp = await request(app)
//         .patch(`/companies/nope`)
//         .send({
//           name: "new nope",
//         })
//         .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(404);
//   });

//   test("bad request on handle change attempt - ADMIN", async function () {
//     const resp = await request(app)
//         .patch(`/companies/c1`)
//         .send({
//           handle: "c1-new",
//         })
//         .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(400);
//   });

//   test("bad request on invalid data - ADMIN", async function () {
//     const resp = await request(app)
//         .patch(`/companies/c1`)
//         .send({
//           logoUrl: "not-a-url",
//         })
//         .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(400);
//   });

//   // NOT ADMIN

//   test("works for users - NOT ADMIN", async function () {
//     const resp = await request(app)
//         .patch(`/companies/c1`)
//         .send({
//           name: "C1-new",
//         })
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("not found on no such company - NOT ADMIN", async function () {
//     const resp = await request(app)
//         .patch(`/companies/nope`)
//         .send({
//           name: "new nope",
//         })
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("bad request on handle change attempt - NOT ADMIN", async function () {
//     const resp = await request(app)
//         .patch(`/companies/c1`)
//         .send({
//           handle: "c1-new",
//         })
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("bad request on invalid data - NOT ADMIN", async function () {
//     const resp = await request(app)
//         .patch(`/companies/c1`)
//         .send({
//           logoUrl: "not-a-url",
//         })
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(401);
//   });

// });

// /************************************** DELETE /companies/:handle */

// describe("DELETE /companies/:handle", function () {

//   test("unauth for anon", async function () {
//     const resp = await request(app)
//         .delete(`/companies/c1`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   // ADMIN
  
//   test("works for users - ADMIN", async function () {
//     const resp = await request(app)
//         .delete(`/companies/c1`)
//         .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.body).toEqual({ deleted: "c1" });
//   });

//   test("not found for no such company - ADMIN", async function () {
//     const resp = await request(app)
//         .delete(`/companies/nope`)
//         .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(404);
//   });

//   // NOT ADMIN

//   test("works for users - NOT ADMIN", async function () {
//     const resp = await request(app)
//         .delete(`/companies/c1`)
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(401)
//   });

//   test("not found for no such company - NOT ADMIN", async function () {
//     const resp = await request(app)
//         .delete(`/companies/nope`)
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(401);
//   });
// });
