import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { getRequiredEnv, getEnv } from '../config/env.js';

const googleClient = new OAuth2Client();

function createToken(user) {
  return jwt.sign({ userId: user._id, username: user.username, role: user.role }, getRequiredEnv('JWT_SECRET'), {
    expiresIn: getEnv('JWT_EXPIRES_IN', '1h'),
  });
}

async function register(req, res, next) {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Username, password, and role are required' });
    }

    if (!['faculty', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Role must be faculty or student' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash, role });
    const token = createToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = createToken(user);

    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function googleLogin(req, res, next) {
  try {
    const { credential, role } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: getRequiredEnv('GOOGLE_CLIENT_ID'),
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email) {
      return res.status(401).json({ message: 'Invalid Google credential' });
    }

    const { sub: googleId, email, name } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      if (!role) {
        return res.status(400).json({ message: 'Role is required for new accounts' });
      }
      user = await User.create({
        username: name || email.split('@')[0],
        email,
        googleId,
        role,
      });
    } else if (!user.googleId) {
      // Link Google account to existing user matched by email
      user.googleId = googleId;
      await user.save();
    }

    const appToken = createToken(user);

    return res.json({
      token: appToken,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export { register, login, googleLogin };
