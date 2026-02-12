import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { authConfig } from '../config/auth';

export const AuthController = {
  register: async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const userExists = await prisma.user.findUnique({
        where: { email },
      });

      if (userExists) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 8);

      // Check if this is the first user OR specific admin email
      const userCount = await prisma.user.count();
      const isFirstUser = userCount === 0;
      const isAdminEmail = email.toLowerCase() === 'admin@dafoor.com';
      
      const role = (isFirstUser || isAdminEmail) ? 'ADMIN' : 'USER';

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || 'Student',
          role
        },
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role }, 
        authConfig.jwtSecret, 
        { expiresIn: authConfig.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
      );

      // Exclude password from response
      const { password: _, ...userWithoutPassword } = user;

      return res.json({
        user: {
            ...userWithoutPassword,
            role: user.role, // Force include role here too
            fileLimit: user.fileLimit,
            messageLimit: user.messageLimit,
            filesCount: user.filesCount,
            messagesCount: user.messagesCount
        },
        token,
      });
    } catch (error) {
      console.error('Registration Error:', error);
      return res.status(500).json({ error: 'Registration failed' });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      // Check password
      if (!user.password) {
          return res.status(400).json({ error: 'Invalid account state. Please contact support.' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role }, 
        authConfig.jwtSecret, 
        { expiresIn: authConfig.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
      );

      const { password: _, ...userWithoutPassword } = user;

      return res.json({
        user: {
            ...userWithoutPassword,
            role: user.role, // Force include role here too
            fileLimit: user.fileLimit,
            messageLimit: user.messageLimit,
            filesCount: user.filesCount,
            messagesCount: user.messagesCount
        },
        token,
      });
    } catch (error) {
      console.error('Login Error:', error);
      return res.status(500).json({ error: 'Login failed' });
    }
  },

  me: async (req: Request, res: Response) => {
    try {
        console.log("ME Endpoint Called. User ID:", req.user?.id);
        
        if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        console.log("DB User Result:", JSON.stringify(user, null, 2));

        if (!user) return res.status(404).json({ error: 'User not found' });

        const responseData = {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            role: user.role,
            fileLimit: user.fileLimit,
            messageLimit: user.messageLimit,
            filesCount: user.filesCount,
            messagesCount: user.messagesCount
        };

        console.log("Sending Response:", JSON.stringify(responseData, null, 2));

        return res.json(responseData);
    } catch (error) {
        console.error("Me Error:", error);
        return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  }
};
