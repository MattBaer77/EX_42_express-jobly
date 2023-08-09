const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");


describe("sqlForPartialUpdate", function () {

    test("works: all inputs", function () {

        const dataToUpdate = { 

            firstName: "Michael",
            lastName: "Jordan"

        }

        const jsToSql = {

            firstName: "first_name",
            lastName: "last_name"

        }

        reFormattedSql = sqlForPartialUpdate(dataToUpdate, jsToSql)

        expect(reFormattedSql).toEqual(
            {
                setCols: '"first_name"=$1, "last_name"=$2',
                values: [ 'Michael', 'Jordan' ]
            }
        )

    })

    test("works: partial jsToSql", function () {

        const dataToUpdate = { 

            firstName: "Michael",
            lastName: "Jordan"

        }

        const jsToSql = {

            firstName: "first_name",

        }

        reFormattedSql = sqlForPartialUpdate(dataToUpdate, jsToSql)

        console.log(reFormattedSql)

        expect(reFormattedSql).toEqual(
            {
                setCols: '"first_name"=$1, "lastName"=$2',
                values: [ 'Michael', 'Jordan' ]
            }
        )

    })

    test("works: no jsToSql", function () {

        const dataToUpdate = { 

            firstName: "Michael",
            lastName: "Jordan"

        }

        const jsToSql = {

        }

        reFormattedSql = sqlForPartialUpdate(dataToUpdate, jsToSql)

        console.log(reFormattedSql)

        expect(reFormattedSql).toEqual(
            {
                setCols: '"firstName"=$1, "lastName"=$2',
                values: [ 'Michael', 'Jordan' ]
            }
        )

    })

    test("works: partial dataToUpdate", function () {

        const dataToUpdate = { 

            firstName: "Michael",

        }

        const jsToSql = {

            firstName: "first_name",
            lastName: "last_name"

        }

        reFormattedSql = sqlForPartialUpdate(dataToUpdate, jsToSql)

        expect(reFormattedSql).toEqual(
            {
                setCols: '"first_name"=$1',
                values: [ 'Michael' ]
            }
        )

    })

})

describe("sqlForPartialUpdate - Error Cases", function () {


    test("doesn't work: no inputs", function () {

        const dataToUpdate = { 

        }

        const jsToSql = {

        }

        expect(() => (sqlForPartialUpdate(dataToUpdate, jsToSql))).toThrow(new BadRequestError("No data"))

    })

    test("doesn't work: no inputs dataToUpdate", function () {

        const dataToUpdate = { 

        }

        const jsToSql = {

            firstName: "first_name",
            lastName: "last_name"

        }

        expect(() => (sqlForPartialUpdate(dataToUpdate, jsToSql))).toThrow(new BadRequestError("No data"))

    })

})