"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");

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

/************************************** POST /users */

describe("POST /users", function () {

  // ANON

  test("unauth for anon", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          firstName: "First-new",
          lastName: "Last-newL",
          password: "password-new",
          email: "new@email.com",
          isAdmin: true,
        });
    expect(resp.statusCode).toEqual(401);
  });

  // ADMIN

  test("works for users: create non-admin ADMIN", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          firstName: "First-new",
          lastName: "Last-newL",
          password: "password-new",
          email: "new@email.com",
          isAdmin: false,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        email: "new@email.com",
        isAdmin: false,
      }, token: expect.any(String),
    });
  });

  test("works for users: create admin ADMIN", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          firstName: "First-new",
          lastName: "Last-newL",
          password: "password-new",
          email: "new@email.com",
          isAdmin: true,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        email: "new@email.com",
        isAdmin: true,
      }, token: expect.any(String),
    });
  });

  test("bad request if missing data ADMIN", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data ADMIN", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          firstName: "First-new",
          lastName: "Last-newL",
          password: "password-new",
          email: "not-an-email",
          isAdmin: true,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  // NOT ADMIN

  test("fails for users: create non-admin - NOT ADMIN", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          firstName: "First-new",
          lastName: "Last-newL",
          password: "password-new",
          email: "new@email.com",
          isAdmin: false,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);

  });

  test("fails for users: create admin - NOT ADMIN", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          firstName: "First-new",
          lastName: "Last-newL",
          password: "password-new",
          email: "new@email.com",
          isAdmin: true,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);

  });

  test("fails - bad request if missing data - NOT ADMIN", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("fails - bad request if invalid data - NOT ADMIN", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          firstName: "First-new",
          lastName: "Last-newL",
          password: "password-new",
          email: "not-an-email",
          isAdmin: true,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

});


/************************************** GET /users */

describe("GET /users", function () {

  // ANON

  test("unauth for anon", async function () {
    const resp = await request(app)
        .get("/users");
    expect(resp.statusCode).toEqual(401);
  });

  // ADMIN

  test("works for users - ADMIN", async function () {
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      users: [
        {
          username: "u1",
          firstName: "U1F",
          lastName: "U1L",
          email: "user1@user.com",
          isAdmin: false,
        },
        {
          username: "u2",
          firstName: "U2F",
          lastName: "U2L",
          email: "user2@user.com",
          isAdmin: false,
        },
        {
          username: "u3",
          firstName: "U3F",
          lastName: "U3L",
          email: "user3@user.com",
          isAdmin: false,
        },
      ],
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE users CASCADE");
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(500);
  });

  // NOT ADMIN

  test("fails for users - NOT ADMIN", async function () {
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401)
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE users CASCADE");
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

});

/************************************** GET /users/:username */

describe("GET /users/:username", function () {

  // ANON

  test("unauth for anon - ANON", async function () {
    const resp = await request(app)
        .get(`/users/u1`);
    expect(resp.statusCode).toEqual(401);
  });

  // ADMIN

  test("works for users - ADMIN", async function () {
    const resp = await request(app)
        .get(`/users/u1`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
      },
    });
  });

  test("not found if user not found - ADMIN", async function () {
    const resp = await request(app)
        .get(`/users/nope`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  // NOT ADMIN IS USER

  test("works for user - NOT ADMIN IS USER", async function () {
    const resp = await request(app)
        .get(`/users/u1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
      },
    });
  });

  // NOT ADMIN NOT USER

  test("unauth for users - NOT ADMIN NOT USER", async function () {
    const resp = await request(app)
        .get(`/users/u2`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401)
  });

  test("unauth - not found if user not found - NOT ADMIN NOT USER", async function () {
    const resp = await request(app)
        .get(`/users/nope`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });


});

/************************************** PATCH /users/:username */

describe("PATCH /users/:username", () => {

  // ANON

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          firstName: "New",
        });
    expect(resp.statusCode).toEqual(401);
  });

  // ADMIN

  test("works for users - ADMIN", async function () {
    const resp = await request(app)
        .patch(`/users/u2`)
        .send({
          firstName: "New",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "u2",
        firstName: "New",
        lastName: "U2L",
        email: "user2@user.com",
        isAdmin: false,
      },
    });
  });

  test("not found if no such user - ADMIN", async function () {
    const resp = await request(app)
        .patch(`/users/nope`)
        .send({
          firstName: "Nope",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if invalid data - ADMIN", async function () {
    const resp = await request(app)
        .patch(`/users/u2`)
        .send({
          firstName: 42,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("works: set new password - ADMIN", async function () {
    const resp = await request(app)
        .patch(`/users/u2`)
        .send({
          password: "new-password",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "u2",
        firstName: "U2F",
        lastName: "U2L",
        email: "user2@user.com",
        isAdmin: false,
      },
    });
    const isSuccessful = await User.authenticate("u2", "new-password");
    expect(isSuccessful).toBeTruthy();
  });

  // NOT ADMIN IS USER

  test("works for users - NOT ADMIN IS USER", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          firstName: "New",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "New",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
      },
    });
  });

  test("bad request if invalid data - NOT ADMIN IS USER", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          firstName: 42,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("works: set new password  - NOT ADMIN IS USER", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          password: "new-password",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
      },
    });
    const isSuccessful = await User.authenticate("u1", "new-password");
    expect(isSuccessful).toBeTruthy();
  });

  // NOT ADMIN NOT USER

  test("unauth for users - NOT ADMIN NOT USER", async function () {
    const resp = await request(app)
        .patch(`/users/u2`)
        .send({
          firstName: "New",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401)
  });

  test("unauth not found if no such user - NOT ADMIN NOT USER", async function () {
    const resp = await request(app)
        .patch(`/users/nope`)
        .send({
          firstName: "Nope",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth if invalid data - NOT ADMIN NOT USER", async function () {
    const resp = await request(app)
        .patch(`/users/u2`)
        .send({
          firstName: 42,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth: set new password - NOT ADMIN NOT USER", async function () {
    const resp = await request(app)
        .patch(`/users/u2`)
        .send({
          password: "new-password",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401)
  });

});

/************************************** DELETE /users/:username */

describe("DELETE /users/:username", function () {

  // ANON

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/users/u1`);
    expect(resp.statusCode).toEqual(401);
  });

  // ADMIN

  test("works for users - ADMIN", async function () {
    const resp = await request(app)
        .delete(`/users/u1`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: "u1" });
  });


  test("not found if user missing - ADMIN", async function () {
    const resp = await request(app)
        .delete(`/users/nope`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  // NOT ADMIN IS USER

  test("works for users - NOT ADMIN IS USER", async function () {
    const resp = await request(app)
        .delete(`/users/u1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "u1" });
  });

  // NOT ADMIN NOT USER

  test("unauth for users - NOT ADMIN NOT USER", async function () {
    const resp = await request(app)
        .delete(`/users/u2`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401)
  });

  test("unauth not found if user missing - NOT ADMIN NOT USER", async function () {
    const resp = await request(app)
        .delete(`/users/nope`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});


/************************************** POST /users/:username/jobs/:id */

describe("POST /users/:username/job/:id", function () {

  test("works for users - ADMIN", async function () {

    const resp = await request(app)
    .post(`/users/u1/jobs/1`)
    .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201)
    expect(resp.body).toEqual({"applied" : "1"})

  })

  test("works for users - THAT USER", async function () {

    const resp = await request(app)
    .post(`/users/u1/jobs/1`)
    .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201)
    expect(resp.body).toEqual({"applied" : "1"})

  })

  test("fails for users - JOB DOESN'T EXIST - ADMIN", async function () {

    const resp = await request(app)
    .post(`/users/u1/jobs/0`)
    .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404)

  })

  test("fails for users - JOB DOESN'T EXIST - THAT USER", async function () {

    const resp = await request(app)
    .post(`/users/u1/jobs/0`)
    .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404)

  })

  test("fails for incorrect users - THAT USER", async function () {

    const resp = await request(app)
    .post(`/users/u2/jobs/1`)
    .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401)

  })

  test("fails for anon - THAT USER", async function () {

    const resp = await request(app)
    .post(`/users/u2/jobs/1`);
    expect(resp.statusCode).toEqual(401)

  })

  test("fails for users USER DOESN'T EXIST - ADMIN", async function () {

    const resp = await request(app)
    .post(`/users/u0/jobs/1`)
    .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404)

  })


});