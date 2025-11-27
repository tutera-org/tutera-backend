import mongoSanitize from 'express-mongo-sanitize';

export const sanitizeData = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized key ${key} from ${req.originalUrl}`);
  },
});
