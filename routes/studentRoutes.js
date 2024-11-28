const express = require('express');
const router = express.Router();
const Student = require('../models/student');

// POST route to create a new student
router.post('/create', async (req, res) => {
  const { name, email } = req.body;
  try {
    const newStudent = new Student({ name, email });
    await newStudent.save();
    res.status(201).json({ message: 'Student created successfully', student: newStudent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH route to change a student's mentor
router.patch('/change-mentor', async (req, res) => {
  const { studentId, mentorId } = req.body;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    student.mentor = mentorId;

    await student.save();

    res.status(200).json({ message: 'Student mentor updated successfully', student });
  } catch (err) {
    res.status(500).json({ error: 'An error occurred while updating the mentor' });
  }
});

// GET route to get all unassigned students (students without mentors)
router.get('/unassigned', async (req, res) => {
  try {
    const students = await Student.find({ mentor: null });
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET route to get the mentor history of a student
router.get('/:studentId/mentors-history', async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await Student.findById(studentId).populate('mentor');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // History could be stored in a different field or model, but here we will assume it's just the current mentor
    res.status(200).json({ student, mentor: student.mentor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

