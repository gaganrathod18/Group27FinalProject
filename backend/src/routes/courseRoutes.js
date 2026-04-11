import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleCheck.js';
import {
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
} from '../controllers/courseController.js';

const router = express.Router();

router.use(authenticate);

// Public courses endpoints (accessible by both roles)
router.get('/courses', listCourses);
router.get('/course/:id?', getCourse);

// Faculty-only endpoints
router.post('/course', checkRole(['faculty']), createCourse);
router.put('/course/:id', checkRole(['faculty']), updateCourse);
router.delete('/course/:id', checkRole(['faculty']), deleteCourse);
router.get('/faculty/courses', checkRole(['faculty']), getFacultyCourses);
router.post('/course/:id/announcement', checkRole(['faculty']), addAnnouncement);

// Student-only endpoints
router.post('/enroll', checkRole(['student']), enrollCourse);
router.get('/enrollments', checkRole(['student']), getStudentEnrollments);
router.delete('/enrollment/:enrollmentId', checkRole(['student']), unenrollCourse);

export default router;
