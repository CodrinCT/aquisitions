import { db } from '#config/database.js';
import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';

export const hashPassword = async password => {
  try {
    return bcrypt.hash(password, 10);
  } catch (error) {
    logger.error('Error comparing password:', error);
    throw new Error('Failed to compare password');
  }
};

export const comparePassword = async (password, hash) => {
  try {
    return bcrypt.compare(password, hash);
  } catch (error) {
    logger.error('Error comparing password:', error);
    throw new Error('Failed to compare password');
  }
};

export const authenticateUser = async (email, password) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }
    logger.info('User authenticated successfully', { email });
    return user;
  } catch (error) {
    logger.error('Error authenticating user:', error);
    if (error.message === 'Invalid credentials') {
      throw error;
    }
    throw new Error('Failed to authenticate user');
  }
};

export const createUser = async ({ email, name, password, role = 'user' }) => {
  try {
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }
    const hashedPassword = await hashPassword(password);
    const [newuser] = await db
      .insert(users)
      .values({
        email,
        name,
        password: hashedPassword,
        role,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    logger.info('User created successfully', { email, role });
    return newuser;
  } catch (error) {
    logger.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
};
