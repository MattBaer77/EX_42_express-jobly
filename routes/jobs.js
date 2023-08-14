"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobCommonSchema = require("../schemas/jobCommon.json");

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { title, salary, equity, companyHandle }
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobCommonSchema);
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

// /** GET /  =>
//  *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
//  *
//  * Can filter on provided search filters:
//  * - minEmployees
//  * - maxEmployees
//  * - nameLike (will find case-insensitive, partial matches)
//  *
//  * Authorization required: none
//  */

// router.get("/", async function (req, res, next) {

//   if (!req.query.nameLike && !req.query.maxEmployees && !req.query.minEmployees) {

//     console.log(req.query)

//     console.log({message:"Unfiltered Search"})

//     try {
//       const companies = await Company.findAll();
//       return res.json({ companies });
//     } catch (err) {
//       return next(err);
//     }

//   }

//   if (!req.query.maxEmployees && !req.query.minEmployees) {

//     console.log(req.query)

//     console.log({message:"Name Only Search"})

//     try {
//       const companies = await Company.findNameLikeOnly(req.query);
//       return res.json({ companies });
//     } catch (err) {
//       return next(err);
//     }

//   }

//   if (!req.query.nameLike && !req.query.minEmployees) {

//     console.log(req.query)

//     console.log({message:"Max Only Search"})

//     try {
//       const companies = await Company.findMaxEmployeesOnly(req.query);
//       return res.json({ companies });
//     } catch (err) {
//       return next(err);
//     }

//   }

//   if (!req.query.nameLike && !req.query.maxEmployees) {

//     console.log(req.query)

//     console.log({message:"Min Only Search"})

//     try {
//       const companies = await Company.findMinEmployeesOnly(req.query);
//       return res.json({ companies });
//     } catch (err) {
//       return next(err);
//     }

//   } 
  
//   if (req.query.nameLike && !req.query.maxEmployees) {

//     console.log(req.query)

//     console.log({message:"Name + Min Search"})

//     try {
//       const companies = await Company.findNameLikeMinEmployees(req.query);
//       return res.json({ companies });
//     } catch (err) {
//       return next(err);
//     }

//   }
  
//   if (req.query.nameLike && !req.query.minEmployees) {

//     console.log(req.query)

//     console.log({message:"Name + Max Search"})

//     try {
//       const companies = await Company.findNameLikeMaxEmployees(req.query);
//       return res.json({ companies });
//     } catch (err) {
//       return next(err);
//     }

//   }

//   if (!req.query.nameLike) {

//     console.log(req.query)

//     console.log({message: "Min + Max Search"})

//     try {
//       const companies = await Company.findMinMaxEmployees(req.query);
//       return res.json({ companies });
//     } catch (err) {
//       return next(err);
//     }

//   } else {

//     console.log(req.query)

//     console.log({message:"Name + Min + Max Search"})

//     try {
//       const companies = await Company.findAllFilter(req.query);
//       return res.json({ companies });
//     } catch (err) {
//       return next(err);
//     }

//   }

// });

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
