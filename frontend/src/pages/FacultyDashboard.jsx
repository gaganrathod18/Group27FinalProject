import { useEffect, useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CourseFormDialog from '../components/CourseFormDialog';
import CourseTable from '../components/CourseTable';
import CourseContentDialog from '../components/CourseContentDialog';

export default function FacultyDashboard() {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [viewCourse, setViewCourse] = useState(null);

  async function loadCourses() {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/faculty/courses');
      setCourses(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  function handleCreate() {
    setSelectedCourse(null);
    setFormOpen(true);
  }

  function handleEdit(course) {
    setSelectedCourse(course);
    setFormOpen(true);
  }

  async function handleSave(formValue) {
    try {
      if (selectedCourse) {
        await api.put(`/course/${selectedCourse._id}`, formValue);
      } else {
        await api.post('/course', formValue);
      }
      setFormOpen(false);
      await loadCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save course');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }
    try {
      await api.delete(`/course/${deleteTarget._id}`);
      setDeleteTarget(null);
      await loadCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete course');
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
            {user?.username} (Faculty)
          </Typography>
          <IconButton color="inherit" onClick={logout} title="Logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 5 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4">Course management</Typography>
            <Typography color="text.secondary">
              Create, edit, delete, and manage your courses.
            </Typography>
          </Box>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Button startIcon={<AddIcon />} variant="contained" onClick={handleCreate}>
              New course
            </Button>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {loading ? <Alert severity="info">Loading courses...</Alert> : null}

          {!loading ? (
            <CourseTable 
              courses={courses} 
              onEdit={handleEdit} 
              onDelete={setDeleteTarget} 
              onView={setViewCourse} 
            />
          ) : null}
        </Stack>
      </Container>

      <CourseContentDialog 
        open={Boolean(viewCourse)} 
        onClose={() => setViewCourse(null)} 
        course={viewCourse} 
      />

      <CourseFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        course={selectedCourse}
      />

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete course</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deleteTarget?.title}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
