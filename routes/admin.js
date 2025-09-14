// routes/admin.js
const express = require("express");
const router = express.Router();
const College = require("../models/College.js");
const Department = require("../models/Department.js");
const Class = require("../models/Class.js");
const Subject = require("../models/Subject.js");
const Teacher = require("../models/Teacher.js");
const { ensureAuthenticated, checkRole } = require("../middleware/auth");

// Render the create college form
router.get(
  "/college/create",
  ensureAuthenticated,
  checkRole("admin"),
  (req, res) => {
    res.render("admin/createCollege");
  }
);

// Handle form submission
// router.post("/college", async (req, res) => {
//   try {
//     const { name, location } = req.body;
//     const college = new College({ name, location, createdBy: req.user._id });
//     await college.save();
//     req.flash("success_msg", "College created successfully!");
//     // res.redirect("/admin/college/create?success=1");
//     res.redirect("/admin/colleges");
//   } catch (err) {
//     console.error("Error creating college:", err);
//     res.render("admin/createCollege", { error: "Failed to create college." });
//   }
// });

router.post(
  "/college",
  ensureAuthenticated,
  checkRole("admin"),
  async (req, res) => {
    try {
      const { name, location } = req.body;
      const college = new College({
        name,
        location,
        createdBy: req.user._id,
      });
      await college.save();
      req.flash("success_msg", "College created successfully!");
      res.redirect("/admin/colleges");
    } catch (err) {
      console.error("Error creating college:", err);
      res.render("admin/createCollege", { error: "Failed to create college." });
    }
  }
);

// View all colleges
router.get(
  "/colleges",
  ensureAuthenticated,
  checkRole("admin"),
  async (req, res) => {
    try {
      const colleges = await College.find();
      console.log(colleges);
      res.render("admin/viewColleges", { colleges });
    } catch (err) {
      console.error("Error fetching colleges:", err);
      res.status(500).send("Error fetching colleges");
    }
  }
);

// Show form to create department under a college
router.get(
  "/department/create/:collegeId",
  ensureAuthenticated,
  checkRole("admin"),
  async (req, res) => {
    try {
      const college = await College.findById(req.params.collegeId);
      if (!college) return res.status(404).send("College not found");

      res.render("admin/createDepartment", { college });
    } catch (err) {
      res.status(500).send("Error loading department form");
    }
  }
);

// Handle department creation
router.post(
  "/department/create/:collegeId",
  ensureAuthenticated,
  checkRole("admin"),
  async (req, res) => {
    try {
      const { name } = req.body;
      const college = await College.findById(req.params.collegeId);
      if (!college) return res.status(404).send("College not found");

      const department = new Department({ name, collegeId: college._id });
      await department.save();

      res.redirect("/admin/colleges"); // Or redirect to dept list if you have one
    } catch (err) {
      console.error("College Id: ", req.params.collegeId);
      console.error("Error creating department:", err);
      res.status(500).send("Error creating department");
    }
  }
);

// View departments under a college
router.get(
  "/college/:collegeId/departments",
  ensureAuthenticated,
  checkRole("admin"),
  async (req, res) => {
    try {
      const college = await College.findById(req.params.collegeId);
      if (!college) return res.status(404).send("College not found");

      const departments = await Department.find({ collegeId: college._id });
      res.render("admin/viewDepartments", { college, departments });
    } catch (err) {
      res.status(500).send("Error fetching departments");
    }
  }
);

// Show form to create class under department
router.get(
  "/class/create/:departmentId",
  ensureAuthenticated,
  checkRole("admin"),
  async (req, res) => {
    try {
      // const department = await Department.findById(
      //   req.params.departmentId
      // ).populate("college");
      const department = await Department.findById(
        req.params.departmentId
      ).populate("collegeId");
      if (!department) return res.status(404).send("Department not found");

      res.render("admin/createClass", { department });
    } catch (err) {
      console.error("Error loading class form:", err);
      res.status(500).send("Error loading class form");
    }
  }
);

// Handle class creation
router.post(
  "/class/create/:departmentId",
  ensureAuthenticated,
  checkRole("admin"),
  async (req, res) => {
    try {
      const { name, year } = req.body;
      const department = await Department.findById(req.params.departmentId);
      if (!department) return res.status(404).send("Department not found");

      const newClass = new Class({
        name,
        year,
        departmentId: department._id,
      });

      await newClass.save();
      res.redirect(`/admin/college/${department.collegeId}/departments`);
    } catch (err) {
      console.error("Error creating class:", err);
      res.status(500).send("Error creating class");
    }
  }
);

// View classes under a department
router.get(
  "/department/:deptId/classes",
  ensureAuthenticated,
  checkRole("admin"),
  async (req, res) => {
    try {
      const department = await Department.findById(req.params.deptId).populate(
        "collegeId"
      );
      if (!department) return res.status(404).send("Department not found");

      const classes = await Class.find({ departmentId: department._id });

      res.render("admin/viewClasses", { department, classes });
    } catch (err) {
      res.status(500).send("Error fetching classes");
    }
  }
);

// Show form to create subject under department
router.get(
  "/subject/create/:departmentId",
  ensureAuthenticated,
  checkRole("admin"),
  async (req, res) => {
    try {
      const department = await Department.findById(
        req.params.departmentId
      ).populate("college");
      if (!department) return res.status(404).send("Department not found");

      res.render("admin/createSubject", { department });
    } catch (err) {
      res.status(500).send("Error loading subject form");
    }
  }
);

// Handle subject creation
router.post(
  "/subject/create/:departmentId",
  ensureAuthenticated,
  checkRole("admin"),
  async (req, res) => {
    try {
      const { name, code } = req.body;
      const department = await Department.findById(req.params.departmentId);
      if (!department) return res.status(404).send("Department not found");

      const subject = new Subject({
        name,
        code,
        department: department._id,
      });

      await subject.save();
      res.redirect(`/admin/college/${department.college}/departments`);
    } catch (err) {
      res.status(500).send("Error creating subject");
    }
  }
);

// Show form to create subject under a class (with teachers)
router.get(
  "/class/:classId/subject/create",
  ensureAuthenticated,
  checkRole("admin"),
  async (req, res) => {
    try {
      const cls = await Class.findById(req.params.classId).populate(
        "departmentId"
      );
      const teachers = await Teacher.find(); // show all teachers

      if (!cls) return res.status(404).send("Class not found");

      res.render("admin/createFullSubject", { cls, teachers });
    } catch (err) {
      res.status(500).send("Error loading subject form");
    }
  }
);

router.post(
  "/class/:classId/subject/create",
  ensureAuthenticated,
  checkRole("admin"),
  async (req, res) => {
    try {
      const {
        name,
        type,
        teachingProfId,
        assistantProfId,
        day,
        startTime,
        endTime,
        room,
      } = req.body;

      const cls = await Class.findById(req.params.classId).populate(
        "departmentId"
      );
      if (!cls) return res.status(404).send("Class not found");

      // If only one schedule, convert to array
      const scheduleArray = Array.isArray(day)
        ? day.map((d, i) => ({
            day: d,
            startTime: startTime[i],
            endTime: endTime[i],
            room: room[i],
          }))
        : [
            {
              day,
              startTime,
              endTime,
              room,
            },
          ];

      const subject = new Subject({
        name,
        type,
        classId: cls._id,
        teachingProfId,
        assistantProfId,
        schedule: scheduleArray,
        chapters: [],
      });

      const classExists = await Class.findById(cls._id);
      if (!classExists) return res.status(404).send("Class not found");
      classExists.subjects.push(subject._id);
      await classExists.save();

      await subject.save();

      // const teacher = await Teacher.findById(teachingProfId);
      // teacher.assignedSubjects.push(subject._id);
      // await teacher.save();

      const profIds = [teachingProfId, assistantProfId];

      for (const profId of profIds) {
        if (!profId) continue; // skip if null or undefined

        const teacher = await Teacher.findById(profId);
        if (!teacher) {
          console.warn(`Teacher with ID ${profId} not found.`);
          continue;
        }

        // Avoid duplicate subject assignment
        if (!teacher.assignedSubjects.includes(subject._id)) {
          teacher.assignedSubjects.push(subject._id);
          await teacher.save();
        }
      }

      res.redirect(`/admin/department/${cls.departmentId._id}/classes`);
    } catch (err) {
      res.status(500).send("Error creating subject: " + err.message);
    }
  }
);

// router.get("/subjects/under/class/:id", async (req, res) => {
//   try {
//     const subject = await Subject.find({ classId: req.params.id })
//       .populate("classId")
//       .populate("teachingProfId")
//       .populate("assistantProfId");

//     if (!subject) {
//       return res.status(404).send("Subject not found");
//     }

//     res.render("admin/viewSubject", { subject });
//   } catch (err) {
//     console.error("Error fetching subject:", err);
//     res.status(500).send("Server error");
//   }
// });

router.get(
  "/subjects/under/class/:id",
  ensureAuthenticated,
  checkRole("admin"),
  async (req, res) => {
    try {
      const subjects = await Subject.find({ classId: req.params.id })
        .populate("classId")
        .populate("teachingProfId")
        .populate("assistantProfId");

      if (!subjects || subjects.length === 0) {
        return res.status(404).send("No subjects found for this class");
      }

      res.render("admin/viewSubject", { subjects });
    } catch (err) {
      console.error("Error fetching subjects:", err);
      res.status(500).send("Server error", err);
    }
  }
);

///////////////////
router.get(
  "/subjects/:id",
  ensureAuthenticated,
  checkRole("admin"),
  async (req, res) => {
    try {
      const subject = await Subject.findById(req.params.id)
        .populate("classId")
        .populate("teachingProfId")
        .populate("assistantProfId");

      if (!subject) return res.status(404).send("Subject not found");

      res.render("admin/viewSubject1", {
        subject,
        message: req.query.message || null,
      });
    } catch (err) {
      console.error("Error fetching subject:", err);
      res.status(500).send("Server error");
    }
  }
);

// add chapter under a subject
router.post(
  "/subjects/:id/add-chapter",
  ensureAuthenticated,
  checkRole("admin"),
  async (req, res) => {
    try {
      const { number, title, topics } = req.body;

      const chapter = {
        number,
        title,
        topics: Array.isArray(topics)
          ? topics
          : topics.split(",").map((t) => t.trim()),
      };

      const subject = await Subject.findByIdAndUpdate(
        req.params.id,
        { $push: { chapters: chapter } },
        { new: true }
      );

      if (!subject) return res.status(404).send("Subject not found");

      res.redirect(`/admin/subjects/${subject._id}`);
      // res.redirect(`/subjects/${subject._id}?message=Chapter added successfully`);
    } catch (err) {
      console.error("Error adding chapter:", err);
      res.status(500).send("Server error");
    }
  }
);

router.post(
  "/add/teahcer",
  ensureAuthenticated,
  checkRole("admin"),
  async (req, res) => {
    const { name, email, departmentId } = req.body;

    if (!name || !email || !departmentId) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    try {
      const newTeacher = new Teacher({
        name,
        email,
        departmentId,
        // role: "teaching_professor", // or a default role
      });

      const savedTeacher = await newTeacher.save();
      res.status(201).json(savedTeacher);
    } catch (error) {
      console.error("Error adding teacher:", error);
      res.status(500).json({ message: "Server error while adding teacher." });
    }
  }
);

////////////////////////////////////////
router.post(
  "/department/teacher/create/:deptId",
  ensureAuthenticated,
  checkRole("admin"),
  async (req, res) => {
    try {
      const { name, email } = req.body;
      const department = await Department.findById(req.params.deptId);

      const newTeacher = new Teacher({
        name: name,
        email: email,
        departmentId: department._id,
      });
      await newTeacher.save();
      // res.status(200).send("Teacher created with: ", newTeacher);
      // res.redirect(`admin/college/${department.collegeId}/departments`);
      // res.redirect(`/admin/department/${cls.departmentId._id}/classes`);
      res.redirect(`/admin/college/${department.collegeId}/departments`);
    } catch (error) {
      console.error("Error creating class:", err);
      res.status(500).send("Error creating class");
    }
  }
);

//view Teacher in department
router.get(
  "/department/:deptId/teachers",
  ensureAuthenticated,
  checkRole("admin"),
  async (req, res) => {
    try {
      const department = await Department.findById(req.params.deptId).populate(
        "collegeId"
      );
      if (!department) return res.status(404).send("Department not found");
      const teachers = await Teacher.find({
        departmentId: department._id,
      })
        .populate("departmentId")
        .populate("assignedSubjects");

      res.render("admin/viewTeacher", { department, teachers });
    } catch (err) {
      console.log("Error Fetching teacher: ", err);
      res.status(500).send("Error fetching Teachers");
    }
  }
);

// Show form to create teacher under department
// router.get("/teacher/create/:departmentId", async (req, res) => {
//   try {
//     const department = await Department.findById(
//       req.params.departmentId
//     ).populate("collegeId");
//     if (!department) return res.status(404).send("Department not found");

//     res.render("admin/createTeacher", { department });
//   } catch (err) {
//     console.log("Error loading teacher for: ", err);
//     res.status(500).send("Error loading subject form");
//   }
// });

// Show form to create class under department
router.get(
  "/teacher/create/:departmentId",
  ensureAuthenticated,
  checkRole("admin"),
  async (req, res) => {
    try {
      // const department = await Department.findById(
      //   req.params.departmentId
      // ).populate("college");
      const department = await Department.findById(
        req.params.departmentId
      ).populate("collegeId");
      if (!department) return res.status(404).send("Department not found");

      res.render("admin/createTeacher", { department });
    } catch (err) {
      console.error("Error loading class form:", err);
      res.status(500).send("Error loading class form");
    }
  }
);

module.exports = router;
