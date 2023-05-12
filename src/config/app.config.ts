export const EnvConfiguration = () => ({
  environment: process.env.NODE_ENV || 'dev',
  port: process.env.PORT || 3030,
  hostAPI: process.env.HOST_API,
  jwtSecret: process.env.JWT_SECRET,
});
