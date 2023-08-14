"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { title, salary, equity, companyHandle }
 *
 * Authorization required: login
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { jobs: [ { title, salary, equity, companyHandle }, ...] }
 *
 * Can filter on provided search filters:
 * - title
 * - minSalary
 * - hasEquity
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {

  if (!req.query) {

    console.log(req.query)
    console.log({message:"Unfiltered Search"})

    try {
      const jobs = await Job.findAll();
      return res.json({jobs});
    } catch (err) {
      return next(err);
    }

  }

  console.log(req.query)
  console.log({message: "Filtered Search"})

  try {
    const jobs = await Job.findFilter(req.query);
    return res.json({jobs});
  } catch (err) {
    return next(err);
  }

  // if (!req.query.maxEmployees && !req.query.minEmployees) {

  //   console.log(req.query)

  //   console.log({message:"Title Only Search"})

  // }

  // if (!req.query.nameLike && !req.query.minEmployees) {

  //   console.log(req.query)

  //   console.log({message:"minSalary Only Search"})

  // }

  // if (!req.query.nameLike && !req.query.maxEmployees) {

  //   console.log(req.query)

  //   console.log({message:"hasEquity Only Search"})

  // } 
  
  // if (req.query.nameLike && !req.query.maxEmployees) {

  //   console.log(req.query)

  //   console.log({message:"Title + minSalary Search"})

  // }
  
  // if (req.query.nameLike && !req.query.minEmployees) {

  //   console.log(req.query)

  //   console.log({message:"Title + hasEquity Search"})

  // }

  // if (!req.query.nameLike) {

  //   console.log(req.query)

  //   console.log({message: "minSalary + hasEquity Search"})

  // } else {

  //   console.log(req.query)

  //   console.log({message:"Title + minSalary + hasEquity Search"})

  // }

});

// /** GET /[handle]  =>  { company }
//  *
//  *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
//  *   where jobs is [{ id, title, salary, equity }, ...]
//  *
//  * Authorization required: none
//  */

// router.get("/:handle", async function (req, res, next) {
//   try {
//     const company = await Company.get(req.params.handle);
//     return res.json({ company });
//   } catch (err) {
//     return next(err);
//   }
// });

// /** PATCH /[handle] { fld1, fld2, ... } => { company }
//  *
//  * Patches company data.
//  *
//  * fields can be: { name, description, numEmployees, logo_url }
//  *
//  * Returns { handle, name, description, numEmployees, logo_url }
//  *
//  * Authorization required: login
//  */

// router.patch("/:handle", ensureAdmin, async function (req, res, next) {
//   try {
//     const validator = jsonschema.validate(req.body, companyUpdateSchema);
//     if (!validator.valid) {
//       const errs = validator.errors.map(e => e.stack);
//       throw new BadRequestError(errs);
//     }

//     const company = await Company.update(req.params.handle, req.body);
//     return res.json({ company });
//   } catch (err) {
//     return next(err);
//   }
// });

// /** DELETE /[handle]  =>  { deleted: handle }
//  *
//  * Authorization: login
//  */

// router.delete("/:handle", ensureAdmin, async function (req, res, next) {
//   try {
//     await Company.remove(req.params.handle);
//     return res.json({ deleted: req.params.handle });
//   } catch (err) {
//     return next(err);
//   }
// });


module.exports = router;
