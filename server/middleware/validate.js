const { z } = require('zod');

// Register Schema: name, valid email, password minimum 8 chars
const registerSchema = z.object({
  name: z.string({
    required_error: 'Name is required'
  }).trim().min(1, 'Name cannot be empty').max(100, 'Name must not exceed 100 characters'),
  email: z.string({
    required_error: 'Email is required'
  }).trim().email('Invalid email address').toLowerCase(),
  password: z.string({
    required_error: 'Password is required'
  }).min(8, 'Password must be at least 8 characters long').max(128, 'Password must not exceed 128 characters')
});

// Login Schema: email, password
const loginSchema = z.object({
  email: z.string({
    required_error: 'Email is required'
  }).trim().email('Invalid email address').toLowerCase(),
  password: z.string({
    required_error: 'Password is required'
  }).min(1, 'Password is required')
});

// Generate Itinerary Schema:
// destination bounded string, days integer 1-14, budget positive number, travelers positive integer, style bounded string
const generateItinerarySchema = z.object({
  destination: z.string({
    required_error: 'Destination is required'
  }).trim().min(1, 'Destination cannot be empty').max(150, 'Destination is too long'),
  days: z.coerce.number({
    required_error: 'Days is required'
  }).int('Days must be a whole number').min(1, 'Days must be at least 1').max(14, 'Days cannot exceed 14'),
  budget: z.coerce.number({
    required_error: 'Budget is required'
  }).positive('Budget must be a positive number'),
  travelers: z.coerce.number({
    required_error: 'Number of travelers is required'
  }).int('Travelers must be a whole number').min(1, 'Must have at least 1 traveler').max(50, 'Cannot exceed 50 travelers'),
  style: z.string().trim().min(1).max(50).default('balanced')
});

// Replan Schema: bounded userMessage, itinerary object
const replanSchema = z.object({
  userMessage: z.string({
    required_error: 'userMessage is required'
  }).trim().min(1, 'userMessage cannot be empty').max(1000, 'userMessage cannot exceed 1000 characters'),
  itinerary: z.record(z.any(), {
    required_error: 'itinerary is required'
  }).refine((val) => typeof val === 'object' && val !== null, {
    message: 'itinerary must be a valid object'
  })
});

// ObjectId Param Schema for URL parameters (e.g. :id)
const objectIdParamSchema = z.object({
  id: z.string({
    required_error: 'ID parameter is required'
  }).regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format: must be a 24-character hexadecimal ObjectId')
});

// Validation middleware factory
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const issues = result.error.issues || result.error.errors || [];
      const errors = issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }

    // Attach validated/coerced data back to the request
    req[source] = result.data;
    next();
  };
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  generateItinerarySchema,
  replanSchema,
  objectIdParamSchema
};
