export const coockies = {
  getOptions: req => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
    sameSite: 'strict',
    // maxAge: 1000 * 60 * 60 * 24, // 1 day
    maxAge: 1000 * 60 * 15, // 15 minutes
  }),

  set: (res, name, value, options = {}) => {
    res.cookie(name, value, { ...coockies.getOptions(), ...options });
  },

  clear: (res, name, options = {}) => {
    res.clearCookie(name, { ...coockies.getOptions(), ...options });
  },

  get: (req, name) => {
    return req.cookies[name];
  },
};
