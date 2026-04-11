import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

async function listCourses(req, res, next) {
  try {
    const courses = await Course.find().populate('faculty', 'username').sort({ createdAt: -1 });
    return res.json(courses);
  } catch (error) {
    return next(error);
  }
}

async function getCourse(req, res, next) {
  try {
    const courseId = req.params.id || req.query.id || req.query.courseId;

    if (!courseId) {
      return res.status(400).json({ message: 'Course id is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: 'Invalid course id' });
    }

    const course = await Course.findById(courseId).populate('faculty', 'username');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    return res.json(course);
  } catch (error) {
    return next(error);
  }
}

async function createCourse(req, res, next) {
  try {
    const { title, details, semester, enrollStatus, description, syllabus } = req.body;

    if (!title || !details || !semester) {
      return res.status(400).json({ message: 'Title, details, and semester are required' });
    }

    const course = await Course.create({
      title,
      details,
      semester,
      enrollStatus: enrollStatus || 'Open',
      description,
      syllabus,
      faculty: req.user.userId,
    });

    const populatedCourse = await course.populate('faculty', 'username');
    return res.status(201).json(populatedCourse);
  } catch (error) {
    return next(error);
  }
}

async function updateCourse(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid course id' });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.faculty.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only edit your own courses' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate('faculty', 'username');

    return res.json(updatedCourse);
  } catch (error) {
    return next(error);
  }
}

async function deleteCourse(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid course id' });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.faculty.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own courses' });
    }

    await Course.findByIdAndDelete(id);
    return res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    return next(error);
  }
}

async function enrollCourse(req, res, next) {
  try {
    const { courseId } = req.body;

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: 'Valid course id is required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.enrollStatus !== 'Open') {
      return res.status(400).json({ message: 'Course is not open for enrollment' });
    }

    const existingEnrollment = await Enrollment.findOne({
      student: req.user.userId,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(409).json({ message: 'Already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      student: req.user.userId,
      course: courseId,
    });

    await enrollment.populate('course');
    return res.status(201).json(enrollment);
  } catch (error) {
    return next(error);
  }
}

async function getStudentEnrollments(req, res, next) {
  try {
    const enrollments = await Enrollment.find({ student: req.user.userId }).populate('course');
    return res.json(enrollments);
  } catch (error) {
    return next(error);
  }
}

async function unenrollCourse(req, res, next) {
  try {
    const { enrollmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
      return res.status(400).json({ message: 'Invalid enrollment id' });
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    if (enrollment.student.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only unenroll from your own enrollments' });
    }

    await Enrollment.findByIdAndDelete(enrollmentId);
    return res.json({ message: 'Unenrolled successfully' });
  } catch (error) {
    return next(error);
  }
}

async function getFacultyCourses(req, res, next) {
  try {
    const courses = await Course.find({ faculty: req.user.userId }).populate('faculty', 'username').sort({ createdAt: -1 });
    return res.json(courses);
  } catch (error) {
    return next(error);
  }
}

async function addAnnouncement(req, res, next) {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Announcement content is required' });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.faculty.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the faculty of this course can add announcements' });
    }

    course.announcements.push({ content });
    await course.save();

    return res.status(201).json(course);
  } catch (error) {
    return next(error);
  }
}

export {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getStudentEnrollments,
  unenrollCourse,
  getFacultyCourses,
  addAnnouncement,
};
