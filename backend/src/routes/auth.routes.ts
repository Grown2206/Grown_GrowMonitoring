import express from 'express';
import { User } from '../models/User';
import { ApiKey } from '../models/ApiKey';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { validateBody } from '../middleware/validation';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

const apiKeySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
});

// Register
router.post('/register', authLimiter, validateBody(registerSchema), async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const existingEmail = await User.findOne({
      where: { email },
    });

    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = await User.create({
      username,
      email,
      password,
      role: 'user',
    });

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', authLimiter, validateBody(loginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await user.validatePassword(password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await User.findByPk(req.user!.id, {
      attributes: ['id', 'username', 'email', 'role', 'createdAt'],
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Change password
router.post('/change-password', authenticateToken, validateBody(changePasswordSchema), async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user!.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = await user.validatePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// API Keys
router.get('/api-keys', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const apiKeys = await ApiKey.findAll({
      where: { userId: req.user!.id },
      attributes: ['id', 'name', 'description', 'isActive', 'lastUsed', 'createdAt'],
    });

    res.json(apiKeys);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

router.post('/api-keys', authenticateToken, validateBody(apiKeySchema), async (req: AuthRequest, res) => {
  try {
    const { name, description } = req.body;

    const apiKey = await ApiKey.create({
      userId: req.user!.id,
      name,
      description,
      key: ApiKey.generateKey(),
    });

    res.status(201).json(apiKey);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

router.patch('/api-keys/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { isActive } = req.body;
    const apiKey = await ApiKey.findOne({
      where: { id: req.params.id, userId: req.user!.id },
    });

    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    await apiKey.update({ isActive });
    res.json(apiKey);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update API key' });
  }
});

router.delete('/api-keys/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const apiKey = await ApiKey.findOne({
      where: { id: req.params.id, userId: req.user!.id },
    });

    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    await apiKey.destroy();
    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

export default router;
