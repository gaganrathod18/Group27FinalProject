import { useEffect, useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  Divider,
  Fade,
  Grid,
  IconButton,
  List,
  ListItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CampaignIcon from '@mui/icons-material/Campaign';
import BookIcon from '@mui/icons-material/Book';
import InfoIcon from '@mui/icons-material/Info';
import SendIcon from '@mui/icons-material/Send';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 4 }}>{children}</Box>}
    </div>
  );
}

export default function CourseContentDialog({ open, onClose, course }) {
  const theme = useTheme();
  const { user } = useAuth();
  const [tabIndex, setTabIndex] = useState(0);
  const [announcementText, setAnnouncementText] = useState('');
  const [loading, setLoading] = useState(false);
  const [courseState, setCourseState] = useState(course);

  useEffect(() => {
    setCourseState(course);
    if (open) setTabIndex(0);
  }, [course, open]);

  if (!courseState) return null;

  const isInstructor = user?.role === 'faculty' && 
    (courseState.faculty?._id === user.id || courseState.faculty === user.id);

  async function handleAddAnnouncement() {
    if (!announcementText.trim()) return;
    setLoading(true);
    try {
      const response = await api.post(`/course/${courseState._id}/announcement`, {
        content: announcementText
      });
      setCourseState(response.data);
      setAnnouncementText('');
    } catch (err) {
      console.error('Failed to add announcement:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullScreen TransitionComponent={Fade}>
      {/* Custom Header / Navigation */}
      <AppBar 
        elevation={0}
        sx={{ 
          background: 'rgba(8, 17, 31, 0.8)', 
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          color: 'white'
        }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1, fontWeight: 700 }} variant="h6">
            Course Portal
          </Typography>
          <Chip
            label={courseState.enrollStatus}
            color={courseState.enrollStatus === 'Open' ? 'primary' : 'default'}
            variant="filled"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Toolbar>
      </AppBar>

      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: '64px' }}>
        {/* Hero Section */}
        <Box 
          sx={{ 
            background: 'linear-gradient(135deg, #0f1b31 0%, #08111f 100%)', 
            color: 'white',
            pt: 8,
            pb: 12,
            px: 4,
            position: 'relative',
            overflow: 'hidden',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          {/* Decorative background element */}
          <Box 
            sx={{ 
              position: 'absolute', 
              top: -50, 
              right: -50, 
              width: 300, 
              height: 300, 
              borderRadius: '50%', 
              background: 'radial-gradient(circle, rgba(77,208,225,0.1) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} 
          />

          <Container maxWidth="lg">
            <Stack spacing={2}>
              <Typography 
                variant="overline" 
                sx={{ letterSpacing: 3, color: 'primary.main', fontWeight: 700, opacity: 0.8 }}
              >
                {courseState.semester}
              </Typography>
              <Typography variant="h2" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                {courseState.title}
              </Typography>
              <Stack direction="row" spacing={3} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap gap={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PersonIcon sx={{ opacity: 0.6, color: 'primary.main' }} />
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    Instructor: <strong>{courseState.faculty?.username}</strong>
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SchoolIcon sx={{ opacity: 0.6, color: 'primary.main' }} />
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    Active Learning Portal
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Container>
        </Box>

        {/* Content Section */}
        <Container maxWidth="lg" sx={{ mt: -6, pb: 10 }}>
          <Paper elevation={8} sx={{ borderRadius: 4, overflow: 'hidden', bgcolor: 'background.paper' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)', bgcolor: 'background.paper', px: 2 }}>
              <Tabs 
                value={tabIndex} 
                onChange={(e, v) => setTabIndex(v)}
                variant="scrollable"
                scrollButtons="auto"
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab label="Overview" icon={<InfoIcon />} iconPosition="start" sx={{ minHeight: 70, color: 'text.secondary' }} />
                <Tab label="Syllabus" icon={<BookIcon />} iconPosition="start" sx={{ minHeight: 70, color: 'text.secondary' }} />
                <Tab label="Announcements" icon={<CampaignIcon />} iconPosition="start" sx={{ minHeight: 70, color: 'text.secondary' }} />
              </Tabs>
            </Box>

            <Box sx={{ p: { xs: 3, md: 5 }, bgcolor: 'background.paper' }}>
              <TabPanel value={tabIndex} index={0}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  The Course Description
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '1.1rem' }}>
                  {courseState.description || 'Welcome to this course! Detailed description will be shared soon.'}
                </Typography>
                
                <Box sx={{ mt: 6, p: 3, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom color="primary">
                    What you will learn
                  </Typography>
                  <Grid container spacing={2}>
                    {['Foundation concepts', 'Hands-on projects', 'Industry standards', 'Collaborative learning'].map((item) => (
                      <Grid item xs={12} sm={6} key={item}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                          <Typography variant="body2">{item}</Typography>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </TabPanel>

              <TabPanel value={tabIndex} index={1}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Learning Path & Syllabus
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                  {courseState.syllabus || 'The comprehensive syllabus is being finalized.'}
                </Typography>
              </TabPanel>

              <TabPanel value={tabIndex} index={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                  <Typography variant="h4" fontWeight={700}>
                    Class Announcements
                  </Typography>
                </Stack>

                {isInstructor && (
                  <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: 'rgba(77,208,225,0.05)', borderColor: 'primary.main' }}>
                    <Stack spacing={2}>
                      <Typography variant="subtitle2" color="primary" fontWeight={700}>
                        Post new update
                      </Typography>
                      <TextField
                        multiline
                        rows={3}
                        fullWidth
                        placeholder="What's happening in class?"
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                        disabled={loading}
                        sx={{ bgcolor: 'background.default', borderRadius: 1 }}
                      />
                      <Box sx={{ alignSelf: 'flex-end' }}>
                        <Button
                          variant="contained"
                          startIcon={<SendIcon />}
                          onClick={handleAddAnnouncement}
                          disabled={loading || !announcementText.trim()}
                        >
                          Post Announcement
                        </Button>
                      </Box>
                    </Stack>
                  </Paper>
                )}

                {courseState.announcements && courseState.announcements.length > 0 ? (
                  <Stack spacing={2}>
                    {courseState.announcements.map((ann, index) => (
                      <Paper 
                        key={index} 
                        elevation={0} 
                        sx={{ 
                          p: 3, 
                          bgcolor: 'rgba(255,255,255,0.03)', 
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: 3,
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                            <CampaignIcon sx={{ fontSize: 18, color: 'background.default' }} />
                          </Avatar>
                          <Stack spacing={0.5}>
                            <Typography variant="body1" fontWeight={500}>
                              {ann.content}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <CalendarTodayIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(ann.date).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CampaignIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
                    <Typography color="text.secondary">
                      No announcements have been posted yet.
                    </Typography>
                  </Box>
                )}
              </TabPanel>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Dialog>
  );
}
