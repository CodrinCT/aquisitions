import aj from '#config/arcjet.js';
import logger from '#config/logger.js';
import { slidingWindow } from '@arcjet/node';

const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';
    let limit;
    let message;

    switch (role) {
      case 'admin':
        limit = 20; // Admins can make 20 requests per minute
        break;
      case 'user':
        limit = 10; // Regular users can make 10 requests per minute
        break;
      default:
        limit = 5; // Guests can make 5 requests per minute
    }
    message = `As a ${role}, you have ${limit} requests per minute.`;

    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        limit,
        interval: '1m',
        name: `rate_limit_${role}`,
        max: limit,
      })
    );
    const decision = await client.protect(req);
    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn(
        `Bot detected: ${decision.reason.botReason} - IP: ${req.ip} - User-Agent: ${req.headers['user-agent']} - path: ${req.path}`
      );
      return res
        .status(403)
        .json({
          error: 'Access denied',
          message: 'Bot activity detected. Please try again later.',
        });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn(
        `Shield detected: ${decision.reason.shieldReason} - IP: ${req.ip} - User-Agent: ${req.headers['user-agent']} - path: ${req.path} - method: ${req.method}`
      );
      return res
        .status(403)
        .json({
          error: 'Access denied',
          message: 'Shield activity detected. Please try again later.',
        });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn(
        `Rate limit exceeded: ${decision.reason.rateLimitReason} - IP: ${req.ip} - User-Agent: ${req.headers['user-agent']} - path: ${req.path}`
      );
      return res.status(429).json({ error: 'Too many requests', message });
    }

    next();
  } catch (error) {
    console.error('Error in security middleware:', error);
    logger.error('Error in security middleware:', error);
    res
      .status(500)
      .json({
        error: 'Internal server error',
        message: 'Something went wrong in the security middleware',
      });
  }
};

export default securityMiddleware;
