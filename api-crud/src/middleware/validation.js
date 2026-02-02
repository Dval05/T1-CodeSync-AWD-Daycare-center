import { errorMessages, respondValidation } from '../utils/errorMessages.js';
import { isString, isNumber, isBoolean, isISODate, inRange, validateCedulaEcuatoriana } from '../utils/validators.js';
import { schemas } from '../config/validationSchemas.js';

const typeCheckers = {
  string: isString,
  number: isNumber,
  boolean: isBoolean,
  date: isISODate,
};

const validateAgainstSchema = (body, schema) => {
  const errors = [];
  Object.entries(schema).forEach(([field, rules]) => {
    const value = body[field];
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(errorMessages.required(field));
      return;
    }
    if (value !== undefined && value !== null) {
      if (rules.type) {
        const checker = typeCheckers[rules.type];
        if (rules.type === 'date' && typeof value === 'string') {
          if (!isISODate(value)) errors.push(errorMessages.format(field, 'YYYY-MM-DD'));
        } else if (checker && !checker(value)) {
          errors.push(errorMessages.type(field, rules.type));
        }
      }
      if (rules.range && !inRange(Number(value), rules.range)) {
        errors.push(errorMessages.range(field, rules.range.min, rules.range.max));
      }
      if (rules.format === 'cedula' && !validateCedulaEcuatoriana(String(value))) {
        errors.push(errorMessages.cedula(field));
      }
    }
  });
  return errors;
};

export const validateResource = () => (req, res, next) => {
  const resource = req.params.resource;
  const schema = schemas[resource];
  if (!schema) return next();
  const errors = validateAgainstSchema(req.body || {}, schema);
  if (errors.length > 0) return respondValidation(res, errors);
  next();
};
