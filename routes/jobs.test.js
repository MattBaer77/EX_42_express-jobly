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

// /************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
          [
            {
              id: 1,
              title: "seed c1 job1",
              salary: 1,
              equity: "0.1",
              companyHandle: 'c1',
            },
            {
              id: 2,
              title: "seed c1 job2",
              salary: 2,
              equity: "0.2",
              companyHandle: 'c1',
            },
            {
              id: 3,
              title: "seed c2 job",
              salary: 3,
              equity: "0.3",
              companyHandle: 'c2',
            },
            {
              id: 4,
              title: "seed c3 job NO EQUITY",
              salary: 4,
              equity: null,
              companyHandle: 'c3',
            },
          ],
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

// /************************************** GET /jobs with filtering */

describe("GET /companies?filters", function () {

  test("ok for anon - filter - title + minSalary + hasEquity - limited by minSalary and hasEquity", async function () {
    const resp = await request(app).get("/jobs?title=seed&minSalary=3&hasEquity=true");
    console.log(resp.body)
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

  test("ok for anon - filter - title + minSalary + - limited by title", async function () {
    const resp = await request(app).get("/jobs?title=job1&minSalary=1");
    expect(resp.body).toEqual(
      {jobs:
        [
          {
            id: 1,
            title: "seed c1 job1",
            salary: 1,
            equity: '0.1',
            companyHandle: 'c1',
          },
        ],
      }
    );
  });

  test("ok for anon - filter - title + minSalary - limited by minSalary", async function () {
    const resp = await request(app).get("/jobs?title=seed&minSalary=2");
    expect(resp.body).toEqual(
      {jobs:
        [
          {
            id: 2,
            title: "seed c1 job2",
            salary: 2,
            equity: '0.2',
            companyHandle: 'c1',
          },
          {
            id: 3,
            title: "seed c2 job",
            salary: 3,
            equity: '0.3',
            companyHandle: 'c2',
          },
          {
            id: 4,
            title: "seed c3 job NO EQUITY",
            salary: 4,
            equity: null,
            companyHandle: 'c3',
          },
        ],
      }
    );
  });

  test("ok for anon - filter - title + minSalary - limited by title", async function () {
    const resp = await request(app).get("/jobs?title=job2&minSalary=2");
    expect(resp.body).toEqual(
      {jobs:
        [
          {
            id: 2,
            title: "seed c1 job2",
            salary: 2,
            equity: '0.2',
            companyHandle: 'c1',
          },
        ],
      }
    );
  });

  test("ok for anon - filter - title + hasEquity - limited by hasEquity", async function () {
    const resp = await request(app).get("/jobs?title=seed&hasEquity=true");
    expect(resp.body).toEqual(
      {jobs:
        [
          {
            id: 1,
            title: "seed c1 job1",
            salary: 1,
            equity: "0.1",
            companyHandle: 'c1',
          },
          {
            id: 2,
            title: "seed c1 job2",
            salary: 2,
            equity: '0.2',
            companyHandle: 'c1',
          },
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

  test("ok for anon - filter - title + hasEquity - limited by title", async function () {
    const resp = await request(app).get("/jobs?title=job1&hasEquity=true");
    expect(resp.body).toEqual(
      {jobs:
        [
          {
            id: 1,
            title: "seed c1 job1",
            salary: 1,
            equity: "0.1",
            companyHandle: 'c1',
          },
        ],
      }
    );
  });

  test("ok for anon - filter - minSalary ONLY", async function () {
    const resp = await request(app).get("/jobs?minSalary=3");
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
          {
            id: 4,
            title: "seed c3 job NO EQUITY",
            salary: 4,
            equity: null,
            companyHandle: 'c3',
          },
        ],
      }
    );
  });

  test("ok for anon - filter - hasEquity ONLY - FALSE", async function () {
    const resp = await request(app).get("/jobs?hasEquity=false");
    expect(resp.body).toEqual(
      {jobs:
        [
          {
            id: 4,
            title: "seed c3 job NO EQUITY",
            salary: 4,
            equity: null,
            companyHandle: 'c3',
          },
        ],
      }
    );
  });

  test("ok for anon - filter - hasEquity ONLY - TRUE", async function () {
    const resp = await request(app).get("/jobs?hasEquity=true");
    expect(resp.body).toEqual(
      {jobs:
        [
          {
            id: 1,
            title: "seed c1 job1",
            salary: 1,
            equity: "0.1",
            companyHandle: 'c1',
          },
          {
            id: 2,
            title: "seed c1 job2",
            salary: 2,
            equity: '0.2',
            companyHandle: 'c1',
          },
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

  test("ok for anon - filter - minSalary + hasEquity - TRUE", async function () {
    const resp = await request(app).get("/jobs?minSalary=3&hasEquity=true");
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

  test("ok for anon - filter - minSalary + hasEquity - FALSE", async function () {
    const resp = await request(app).get("/jobs?minSalary=3&hasEquity=false");
    expect(resp.body).toEqual(
      {jobs:
        [
          {
            id: 4,
            title: "seed c3 job NO EQUITY",
            salary: 4,
            equity: null,
            companyHandle: 'c3',
          },
        ],
      }
    );
  });

  test("ok for anon - filter - title Only Search", async function () {
    const resp = await request(app).get("/jobs?title=c1");
    expect(resp.body).toEqual(
      {jobs:
        [
          {
            id: 1,
            title: "seed c1 job1",
            salary: 1,
            equity: "0.1",
            companyHandle: 'c1',
          },
          {
            id: 2,
            title: "seed c1 job2",
            salary: 2,
            equity: '0.2',
            companyHandle: 'c1',
          },
        ],
      }
    );
  });

});

/************************************** GET /jobs/:handle */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/1`);
    expect(resp.body).toEqual({
      job:{
        id: 1,
        title: "seed c1 job1",
        salary: 1,
        equity: "0.1",
        companyHandle: 'c1',
      },
    });
  });

  test("not found for no such company", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });

});

// /************************************** PATCH /companies/:handle */

describe("PATCH /jobs/:id", function () {

  // ANON
  test("unauth for anon - ANON", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          name: "C1-new",
        });

    console.log(resp)

    expect(resp.statusCode).toEqual(401);
  });

//   // ADMIN

  test("works for users - ADMIN", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "not from seed c1 job edited",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job:{
        id: 1,
        title: "not from seed c1 job edited",
        salary: 1,
        equity: "0.1",
        companyHandle: 'c1',
      },
    });
  });

  test("not found on no such job - ADMIN", async function () {
    const resp = await request(app)
        .patch(`/jobs/0`)
        .send({
          title: "new nope",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt - ADMIN", async function () {
    console.log("FAILING")
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          id: 0,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data - ADMIN", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          equity: "Not a Number for Equity",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  // NOT ADMIN

  test("works for users - NOT ADMIN", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "not from seed c1 job edited",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job - NOT ADMIN", async function () {
    const resp = await request(app)
        .patch(`/jobs/0`)
        .send({
          title: "new nope",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request on id change attempt - NOT ADMIN", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          id: 0,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request on invalid data - NOT ADMIN", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          equity: "Not a Number for Equity",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

});

// /************************************** DELETE /companies/:handle */

describe("DELETE /companies/:handle", function () {

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`);
    expect(resp.statusCode).toEqual(401);
  });

  // ADMIN
  
  test("works for users - ADMIN", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`)
        .set("authorization", `Bearer ${adminToken}`);

    console.log(resp.body)

    expect(resp.body).toEqual({ deleted: "1" });
  });

  test("not found for no such company - ADMIN", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  // NOT ADMIN

  test("works for users - NOT ADMIN", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401)
  });

  test("not found for no such company - NOT ADMIN", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});
