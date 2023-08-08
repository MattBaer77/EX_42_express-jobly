const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {

    test("works: ...", function () {

        const dataToUpdate = { 

            lastName: "Jordan",
            firstName: "Michael",


        }

        const jsToSql = {

            lastName: "last_name",
            firstName: "first_name",


        }

        SQL = sqlForPartialUpdate(dataToUpdate, jsToSql)

        console.log(SQL)

        expect(SQL).toBeTruthy


    })


})