import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function CourseTable({ courses, onEdit, onDelete, onView }) {
  if (!courses.length) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">No courses yet</Typography>
        <Typography color="text.secondary">Create a course to get started.</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ overflow: 'hidden' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Details</TableCell>
            <TableCell>Semester</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {courses.map((course) => (
            <TableRow 
              key={course._id} 
              hover 
              sx={{ cursor: 'pointer' }}
              onClick={() => onView(course)}
            >
              <TableCell>
                <Typography fontWeight={700}>{course.title}</Typography>
              </TableCell>
              <TableCell sx={{ maxWidth: 360 }}>
                <Box sx={{ whiteSpace: 'normal' }}>{course.details}</Box>
              </TableCell>
              <TableCell>{course.semester}</TableCell>
              <TableCell>
                <Chip
                  label={course.enrollStatus}
                  color={course.enrollStatus === 'Open' ? 'success' : course.enrollStatus === 'Waitlist' ? 'warning' : 'default'}
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Edit">
                  <IconButton onClick={(e) => {
                    e.stopPropagation();
                    onEdit(course);
                  }}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton color="error" onClick={(e) => {
                    e.stopPropagation();
                    onDelete(course);
                  }}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
