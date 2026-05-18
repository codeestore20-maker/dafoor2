export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
  jwtExpiresIn: '7d', // 7 days
};
