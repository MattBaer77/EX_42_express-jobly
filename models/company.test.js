"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Company = require("./company.js");
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
  const newCompany = {
    handle: "new",
    name: "New",
    description: "New Description",
    numEmployees: 1,
    logoUrl: "http://new.img",
  };

  test("works", async function () {
    let company = await Company.create(newCompany);
    expect(company).toEqual(newCompany);

    const result = await db.query(
          `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'new'`);
    expect(result.rows).toEqual([
      {
        handle: "new",
        name: "New",
        description: "New Description",
        num_employees: 1,
        logo_url: "http://new.img",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Company.create(newCompany);
      await Company.create(newCompany);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let companies = await Company.findAll();
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);
  });
});


/************************************** findAllFilter */

describe("findAllFilter", function () {

  test("works: all filters - all data", async function () {

    const data = {nameLike:"c", minEmployees:"1", maxEmployees:"3"}

    let companies = await Company.findAllFilter(data);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);

  });

  test("works: all filters - min excludes c1", async function () {

    const data = {nameLike:"c", minEmployees:"2", maxEmployees:"3"}

    let companies = await Company.findAllFilter(data);
    expect(companies).toEqual([
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);

  });

  test("works: all filters - min excludes c1 and c2", async function () {

    const data = {nameLike:"c", minEmployees:"3", maxEmployees:"3"}

    let companies = await Company.findAllFilter(data);
    expect(companies).toEqual([
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);

  });

  test("works: all filters - max excludes c3", async function () {

    const data = {nameLike:"c", minEmployees:"1", maxEmployees:"2"}

    let companies = await Company.findAllFilter(data);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      }
    ]);

  });

  test("works: all filters - max excludes c2 and c3", async function () {

    const data = {nameLike:"c", minEmployees:"1", maxEmployees:"1"}

    let companies = await Company.findAllFilter(data);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      }
    ]);

  });

  test("works: all filters - no min/max exclusion - nameLike returns only C1", async function () {

    const data = {nameLike:"c1", minEmployees:"1", maxEmployees:"3"}

    let companies = await Company.findAllFilter(data);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      }
    ]);

  });

  test("works: all filters - no min/max exclusion - nameLike returns no results", async function () {

    const data = {nameLike:"b", minEmployees:"1", maxEmployees:"3"}

    let companies = await Company.findAllFilter(data);

    expect(companies).toEqual([]);

  });

})

/************************************** findNameLikeOnly */

describe("findNameLikeOnly", function () {

  test("works: finds c1 with c1", async function () {

    const data = {nameLike:"c1"}

    let companies = await Company.findNameLikeOnly(data);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      }
    ]);
    
  })

  test("works: finds c2 with c2", async function () {

    const data = {nameLike:"c2"}

    let companies = await Company.findNameLikeOnly(data);
    expect(companies).toEqual([
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      }
    ]);

  })

  test("works: finds all with c", async function () {

    const data = {nameLike:"c"}

    let companies = await Company.findNameLikeOnly(data);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);

  })

  test("works: finds none with b", async function () {

    const data = {nameLike:"b"}

    let companies = await Company.findNameLikeOnly(data);
    expect(companies).toEqual([]);

  })

})

/************************************** findMaxEmployeesOnly */

describe("findMaxEmployeesOnly", function () {

  test("works: finds all with 3", async function () {

    const data = {maxEmployees:3}

    let companies = await Company.findMaxEmployeesOnly(data);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);
    
  })

  test("works: finds c1 and c2 with 2", async function () {

    const data = {maxEmployees:2}

    let companies = await Company.findMaxEmployeesOnly(data);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },

    ]);

  })

  test("works: finds c1 with 1", async function () {

    const data = {maxEmployees:1}

    let companies = await Company.findMaxEmployeesOnly(data);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    ]);

  })

  test("works: finds nothing with 0", async function () {

    const data = {maxEmployees:0}

    let companies = await Company.findMaxEmployeesOnly(data);
    expect(companies).toEqual([

    ]);

  })

})

/************************************** findMinEmployeesOnly */

describe("findMinEmployeesOnly", function () {

  test("works: finds all with 3 with 0", async function () {

    const data = {minEmployees:0}

    let companies = await Company.findMinEmployeesOnly(data);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);
    
  })

  test("works: finds all with 3 with 1", async function () {

    const data = {minEmployees:1}

    let companies = await Company.findMinEmployeesOnly(data);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);
    
  })

  test("works: finds c2 and c3 with 2", async function () {

    const data = {minEmployees:2}

    let companies = await Company.findMinEmployeesOnly(data);
    expect(companies).toEqual([
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);

  });

  test("works: finds c3 with 3", async function () {

    const data = {minEmployees:3}

    let companies = await Company.findMinEmployeesOnly(data);
    expect(companies).toEqual([
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);

  });

  test("works: finds nothing with 4", async function () {

    const data = {minEmployees:4}

    let companies = await Company.findMinEmployeesOnly(data);
    expect(companies).toEqual([]);

  });

})

/************************************** findNameLikeMinEmployees */

describe("findNameLikeMinEmployees", function () {

  test("works: finds all with 'c' and 3 with 0", async function () {

    const data = {nameLike:'c', minEmployees:0}

    let companies = await Company.findNameLikeMinEmployees(data);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);
    
  })

  test("works: finds all with 'c' and 3 with 1", async function () {

    const data = {nameLike:'c', minEmployees:1}

    let companies = await Company.findNameLikeMinEmployees(data);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);
    
  })

  test("works: finds c2 and c3 with 'c' and 2", async function () {

    const data = {nameLike:'c', minEmployees:2}

    let companies = await Company.findNameLikeMinEmployees(data);
    expect(companies).toEqual([
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);

  });

  test("works: finds c3 with 'c' and 3", async function () {

    const data = {nameLike:'c', minEmployees:3}

    let companies = await Company.findNameLikeMinEmployees(data);
    expect(companies).toEqual([
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);

  });

  test("works: finds nothing with 'c' and 4", async function () {

    const data = {nameLike:'c', minEmployees:4}

    let companies = await Company.findNameLikeMinEmployees(data);
    expect(companies).toEqual([]);

  });

  test("works: finds nothing with 'b' and 3 with 0", async function () {

    const data = {nameLike:'b', minEmployees:0}

    let companies = await Company.findNameLikeMinEmployees(data);
    expect(companies).toEqual([]);
    
  })

  test("works: finds nothing with 'b' and 3 with 1", async function () {

    const data = {nameLike:'b', minEmployees:1}

    let companies = await Company.findNameLikeMinEmployees(data);
    expect(companies).toEqual([]);
    
  })

  test("works: finds nothing with 'b' and 2", async function () {

    const data = {nameLike:'b', minEmployees:2}

    let companies = await Company.findNameLikeMinEmployees(data);
    expect(companies).toEqual([]);

  });

  test("works: finds nothing with 'b' and 3", async function () {

    const data = {nameLike:'b', minEmployees:3}

    let companies = await Company.findNameLikeMinEmployees(data);
    expect(companies).toEqual([]);

  });

  test("works: finds nothing with 'b' and 4", async function () {

        const data = {nameLike:'b', minEmployees:4}

    let companies = await Company.findNameLikeMinEmployees(data);
    expect(companies).toEqual([]);

  });

})

/************************************** findNameLikeMaxEmployees */

describe("findNameLikeMaxEmployees", function () {

  test("works: finds all with 'c' and 3", async function () {

    const data = {nameLike:'c', maxEmployees:3}

    let companies = await Company.findNameLikeMaxEmployees(data);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);
    
  })

  test("works: finds c1 and c2 with 'c' and 2", async function () {

    const data = {nameLike:'c', maxEmployees:2}

    let companies = await Company.findNameLikeMaxEmployees(data);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },

    ]);

  })

  test("works: finds c1 with 'c' and 1", async function () {

    const data = {nameLike:'c', maxEmployees:1}

    let companies = await Company.findNameLikeMaxEmployees(data);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    ]);

  })

  test("works: finds nothing with 'c' and 0", async function () {

    const data = {nameLike:'c', maxEmployees:0}

    let companies = await Company.findNameLikeMaxEmployees(data);
    expect(companies).toEqual([

    ]);

  })

  test("works: finds nothing with 'b' and 3", async function () {

    const data = {nameLike:'b', maxEmployees:3}

    let companies = await Company.findNameLikeMaxEmployees(data);
    expect(companies).toEqual([]);
    
  })

  test("works: finds nothing with 'b' and 2", async function () {

    const data = {nameLike:'b', maxEmployees:2}

    let companies = await Company.findNameLikeMaxEmployees(data);
    expect(companies).toEqual([]);

  })

  test("works: finds nothing with 'b' and 1", async function () {

    const data = {nameLike:'b', maxEmployees:1}

    let companies = await Company.findNameLikeMaxEmployees(data);
    expect(companies).toEqual([]);

  })

  test("works: finds nothing with 'b' and 0", async function () {

    const data = {nameLike:'b', maxEmployees:0}

    let companies = await Company.findNameLikeMaxEmployees(data);
    expect(companies).toEqual([

    ]);

  })

})

/************************************** findMinMaxEmployees */

describe("findMinMaxEmployees", function () {

  test("works: finds all with 0 and 3", async function () {

    const data = {minEmployees:0, maxEmployees:3}

    let companies = await Company.findMinMaxEmployees(data);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);
    
  })

  test("works: finds all with 1 and 3", async function () {

    const data = {minEmployees:1, maxEmployees:3}

    let companies = await Company.findMinMaxEmployees(data);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);

  })

  test("works: finds c2 and c3 with 2 and 3", async function () {

    const data = {minEmployees:2, maxEmployees:3}

    let companies = await Company.findMinMaxEmployees(data);
    expect(companies).toEqual([
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);

  })

  test("works: finds c3 with 3 and 3", async function () {

    const data = {minEmployees:3, maxEmployees:3}

    let companies = await Company.findMinMaxEmployees(data);
    expect(companies).toEqual([
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);

  })

  test("works: finds nothing with 4 and 3", async function () {

    const data = {minEmployees:4, maxEmployees:3}

    let companies = await Company.findMinMaxEmployees(data);
    expect(companies).toEqual([]);

  })

  // // 


  test("works: finds c1 and c2 with 0 and 2", async function () {

    const data = {minEmployees:0, maxEmployees:2}

    let companies = await Company.findMinMaxEmployees(data);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },

    ]);

  })

  test("works: finds c1 with 0 and 1", async function () {

    const data = {minEmployees:0, maxEmployees:1}

    let companies = await Company.findMinMaxEmployees(data);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    ]);

  })

  test("works: finds nothing with 0 and 0", async function () {

    const data = {minEmployees:0, maxEmployees:0}

    let companies = await Company.findMinMaxEmployees(data);
    expect(companies).toEqual([]);

  })

  test("works: finds c1 with 1 and 1", async function () {

    const data = {minEmployees:1, maxEmployees:1}

    let companies = await Company.findMinMaxEmployees(data);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    ]);
    
  })

  test("works: finds c2 with 2 and 2", async function () {

    const data = {minEmployees:2, maxEmployees:2}

    let companies = await Company.findMinMaxEmployees(data);
    expect(companies).toEqual([

      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },

    ]);

  })

  test("works: finds c3 with 3 and 3", async function () {

    const data = {minEmployees:3, maxEmployees:3}

    let companies = await Company.findMinMaxEmployees(data);
    expect(companies).toEqual([
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);
    
  })

})

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let company = await Company.get("c1");
    expect(company).toEqual({
      handle: "c1",
      name: "C1",
      description: "Desc1",
      numEmployees: 1,
      logoUrl: "http://c1.img",
    });
  });

  test("not found if no such company", async function () {
    try {
      await Company.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    name: "New",
    description: "New Description",
    numEmployees: 10,
    logoUrl: "http://new.img",
  };

  test("works", async function () {
    let company = await Company.update("c1", updateData);
    expect(company).toEqual({
      handle: "c1",
      ...updateData,
    });

    const result = await db.query(
          `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'c1'`);
    expect(result.rows).toEqual([{
      handle: "c1",
      name: "New",
      description: "New Description",
      num_employees: 10,
      logo_url: "http://new.img",
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      name: "New",
      description: "New Description",
      numEmployees: null,
      logoUrl: null,
    };

    let company = await Company.update("c1", updateDataSetNulls);
    expect(company).toEqual({
      handle: "c1",
      ...updateDataSetNulls,
    });

    const result = await db.query(
          `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'c1'`);
    expect(result.rows).toEqual([{
      handle: "c1",
      name: "New",
      description: "New Description",
      num_employees: null,
      logo_url: null,
    }]);
  });

  test("not found if no such company", async function () {
    try {
      await Company.update("nope", updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Company.update("c1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Company.remove("c1");
    const res = await db.query(
        "SELECT handle FROM companies WHERE handle='c1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Company.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
