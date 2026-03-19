import logger from '#config/logger.js';
import { authenticateUser, createUser } from '#services/auth.service.js';
import { coockies } from '#utils/cookies.js';
import { formatValidationErrors } from '#utils/format.js';
import { jwttoken } from '#utils/jwt.js';
import { signInSchema, signUpSchema } from '#validations/auth.validation.js';

export const signup = async (req, res, next) => {
  try {
    const validationResult = signUpSchema.safeParse(req.body);
    if (!validationResult.success) {
      logger.warn('Signup validation failed', {
        errors: validationResult.error.errors,
      });
      return res.status(400).json({
        error: 'Invalid request data',
        details: formatValidationErrors(validationResult.error),
        extra: validationResult.error,
      });
    }

    const { email, name, password, role } = validationResult.data;

    // AUTH SERVICE CALL

    const user = await createUser({ email, name, password, role });
    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    coockies.set(res, 'token', token);

    logger.info('User signed up successfully', { email, role });
    res.status(201).json({
      message: 'User signed up successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Error in signup controller:', error);
    if (error.message == 'User with this email already exists') {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const validationResult = signInSchema.safeParse(req.body);
    if (!validationResult.success) {
      logger.warn('Sign-in validation failed', {
        errors: validationResult.error.errors,
      });
      return res.status(400).json({
        error: 'Invalid request data',
        details: formatValidationErrors(validationResult.error),
        extra: validationResult.error,
      });
    }

    const { email, password } = validationResult.data;

    const user = await authenticateUser(email, password);
    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    coockies.set(res, 'token', token);

    logger.info('User signed in successfully', { email });
    res.status(200).json({
      message: 'User signed in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Error in sign-in controller:', error);
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: error.message });
    }
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    coockies.clear(res, 'token');
    logger.info('User signed out successfully');
    res.status(200).json({ message: 'User signed out successfully' });
  } catch (error) {
    logger.error('Error in sign-out controller:', error);
    next(error);
  }
};
