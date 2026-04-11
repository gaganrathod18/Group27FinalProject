import { useEffect, useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import EnrollIcon from '@mui/icons-material/Login';
import SearchIcon from '@mui/icons-material/Search';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CourseContentDialog from '../components/CourseContentDialog';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function CourseGrid({ courses, onEnroll, enrollments = [], onView }) {
  if (!courses.length) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">No courses available</Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      {courses.map((course) => {
        const isEnrolled = enrollments.some((e) => (e.course?._id || e.course) === course._id);
        return (
        <Paper 
          key={course._id} 
          sx={{ 
            p: 2, 
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            }
          }}
          onClick={() => onView(course)}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="start">
            <Stack spacing={1} sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                {course.title}
              </Typography>
              <Typography variant="body2">{course.details}</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={`Semester: ${course.semester}`} size="small" />
                <Chip
                  label={course.enrollStatus}
                  size="small"
                  color={course.enrollStatus === 'Open' ? 'success' : course.enrollStatus === 'Waitlist' ? 'warning' : 'default'}
                  variant="outlined"
                />
                {course.faculty?.username && (
                  <Typography variant="caption" color="text.secondary">
                    by {course.faculty.username}
                  </Typography>
                )}
              </Stack>
            </Stack>
            {isEnrolled ? (
              <Button
                variant="contained"
                size="small"
                disabled
                onClick={(e) => e.stopPropagation()}
              >
                Enrolled
              </Button>
            ) : (
              <Button
                startIcon={<EnrollIcon />}
                variant="contained"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEnroll(course);
                }}
                disabled={course.enrollStatus !== 'Open'}
              >
                Enroll
              </Button>
            )}
          </Stack>
        </Paper>
      );
      })}
    </Stack>
  );
}

function EnrolledCourses({ enrollments, onUnenroll, onView }) {
  if (!enrollments.length) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">Not enrolled in any courses yet</Typography>
        <Typography variant="body2" color="text.secondary">
          Browse available courses and enroll to get started.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      {enrollments.map((enrollment) => (
        <Paper 
          key={enrollment._id} 
          sx={{ 
            p: 2,
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            }
          }}
          onClick={() => onView(enrollment.course)}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="start">
            <Stack spacing={1} sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                {enrollment.course?.title}
              </Typography>
              <Typography variant="body2">{enrollment.course?.details}</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={`Semester: ${enrollment.course?.semester}`} size="small" />
                <Chip
                  label={enrollment.course?.enrollStatus}
                  size="small"
                  color={enrollment.course?.enrollStatus === 'Open' ? 'success' : 'default'}
                  variant="outlined"
                />
                {enrollment.course?.faculty?.username && (
                  <Typography variant="caption" color="text.secondary">
                    by {enrollment.course.faculty.username}
                  </Typography>
                )}
              </Stack>
            </Stack>
            <IconButton 
              color="error" 
              onClick={(e) => {
                e.stopPropagation();
                onUnenroll(enrollment);
              }} 
              title="Unenroll"
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [tabIndex, setTabIndex] = useState(0);
  const [allCourses, setAllCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSemester, setFilterSemester] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortOption, setSortOption] = useState('alpha-asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollDialog, setEnrollDialog] = useState(null);
  const [unenrollTarget, setUnenrollTarget] = useState(null);
  const [viewCourse, setViewCourse] = useState(null);

  const uniqueSemesters = ['All', ...new Set(allCourses.map((c) => c.semester))].filter(Boolean);

  const processCourses = (coursesArr, isEnrollment = false) => {
    let result = coursesArr.filter((item) => {
      const courseObj = isEnrollment ? item.course : item;
      if (!courseObj) return false;

      const matchesSearch =
        courseObj.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        courseObj.details?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSemester = filterSemester === 'All' || courseObj.semester === filterSemester;
      const matchesStatus = filterStatus === 'All' || courseObj.enrollStatus === filterStatus;

      return matchesSearch && matchesSemester && matchesStatus;
    });

    result.sort((a, b) => {
      const courseA = isEnrollment ? a.course : a;
      const courseB = isEnrollment ? b.course : b;
      
      if (sortOption === 'alpha-asc') return (courseA?.title || '').localeCompare(courseB?.title || '');
      if (sortOption === 'alpha-desc') return (courseB?.title || '').localeCompare(courseA?.title || '');
      if (sortOption === 'sem-asc') return (courseA?.semester || '').localeCompare(courseB?.semester || '');
      if (sortOption === 'sem-desc') return (courseB?.semester || '').localeCompare(courseA?.semester || '');
      return 0;
    });

    return result;
  };

  const filteredAllCourses = processCourses(allCourses, false);
  const filteredEnrollments = processCourses(enrollments, true);

  async function loadCourses() {
    setLoading(true);
    setError('');
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/enrollments'),
      ]);
      setAllCourses(coursesRes.data);
      setEnrollments(enrollmentsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  async function handleEnroll(course) {
    setEnrollDialog(course);
  }

  async function confirmEnroll() {
    if (!enrollDialog) return;
    try {
      await api.post('/enroll', { courseId: enrollDialog._id });
      setEnrollDialog(null);
      await loadCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll');
    }
  }

  async function handleUnenroll(enrollment) {
    setUnenrollTarget(enrollment);
  }

  async function confirmUnenroll() {
    if (!unenrollTarget) return;
    try {
      await api.delete(`/enrollment/${unenrollTarget._id}`);
      setUnenrollTarget(null);
      await loadCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unenroll');
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', pb: 6 }}>
      <AppBar position="sticky" elevation={0} sx={{ backdropFilter: 'blur(16px)', background: 'rgba(5,12,22,0.85)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800 }}>
            My Courses
          </Typography>
          <Typography sx={{ mr: 2 }} color="text.secondary">
            {user?.username} (Student)
          </Typography>
          <IconButton color="inherit" onClick={logout} title="Logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 5 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4">Course enrollment</Typography>
            <Typography color="text.secondary">
              Browse available courses and manage your enrollments.
            </Typography>
          </Box>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {loading ? <Alert severity="info">Loading courses...</Alert> : null}

          {!loading && (
            <Paper sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                  <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)}>
                    <Tab label={`Available Courses (${allCourses.length})`} />
                    <Tab label={`My Enrollments (${enrollments.length})`} />
                  </Tabs>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <TextField
                    size="small"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ flexGrow: 1, minWidth: 200 }}
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Semester</InputLabel>
                    <Select
                      value={filterSemester}
                      label="Semester"
                      onChange={(e) => setFilterSemester(e.target.value)}
                    >
                      {uniqueSemesters.map(sem => (
                        <MenuItem key={sem} value={sem}>{sem}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filterStatus}
                      label="Status"
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <MenuItem value="All">All Statuses</MenuItem>
                      <MenuItem value="Open">Open</MenuItem>
                      <MenuItem value="Waitlist">Waitlist</MenuItem>
                      <MenuItem value="Closed">Closed</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortOption}
                      label="Sort By"
                      onChange={(e) => setSortOption(e.target.value)}
                    >
                      <MenuItem value="alpha-asc">Title (A-Z)</MenuItem>
                      <MenuItem value="alpha-desc">Title (Z-A)</MenuItem>
                      <MenuItem value="sem-asc">Semester (Asc)</MenuItem>
                      <MenuItem value="sem-desc">Semester (Desc)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <TabPanel value={tabIndex} index={0}>
                <CourseGrid 
                  courses={filteredAllCourses} 
                  onEnroll={handleEnroll} 
                  enrollments={enrollments} 
                  onView={setViewCourse}
                />
              </TabPanel>

              <TabPanel value={tabIndex} index={1}>
                <EnrolledCourses 
                  enrollments={filteredEnrollments} 
                  onUnenroll={handleUnenroll} 
                  onView={setViewCourse}
                />
              </TabPanel>
            </Paper>
          )}
        </Stack>
      </Container>

      <CourseContentDialog 
        open={Boolean(viewCourse)} 
        onClose={() => setViewCourse(null)} 
        course={viewCourse} 
      />

      <Dialog open={Boolean(enrollDialog)} onClose={() => setEnrollDialog(null)}>
        <DialogTitle>Confirm enrollment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enroll in <strong>{enrollDialog?.title}</strong> ({enrollDialog?.semester})?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEnrollDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={confirmEnroll}>
            Enroll
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(unenrollTarget)} onClose={() => setUnenrollTarget(null)}>
        <DialogTitle>Confirm unenroll</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Unenroll from <strong>{unenrollTarget?.course?.title}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnenrollTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmUnenroll}>
            Unenroll
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
