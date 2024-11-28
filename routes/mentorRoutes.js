const express = require('express');
const router = express.Router();
const Mentor = require('../models/mentor');
const Student = require('../models/student');

// POST route to create a new mentor
router.post('/create', async (req, res) => {
  const { name, email } = req.body;
  try {
    const newMentor = new Mentor({ name, email });
    await newMentor.save();
    res.status(201).json({ message: 'Mentor created successfully', mentor: newMentor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST route to assign students to a mentor
router.post('/assign', async (req, res) => {
  const { mentorId, studentIds } = req.body;

  try {
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    const students = await Student.find({ _id: { $in: studentIds } });
    if (students.length !== studentIds.length) {
      return res.status(404).json({ error: 'Some students not found' });
    }

    const unassignedStudents = students.filter((student) => !student.mentor);
    if (unassignedStudents.length !== students.length) {
      return res.status(400).json({ error: 'Some students already have a mentor' });
    }

    await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: { mentor: mentorId } }
    );

    res.status(200).json({ message: 'Students successfully assigned to mentor', students: unassignedStudents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET route to get all students for a particular mentor
router.get('/:mentorId/students', async (req, res) => {
  const { mentorId } = req.params;

  try {
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    const students = await Student.find({ mentor: mentorId });
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


