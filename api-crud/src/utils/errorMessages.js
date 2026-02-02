export const errorMessages = {
  required: (field) => ({ code: 'REQUIRED', field, message: `${field} es requerido` }),
  type: (field, expected) => ({ code: 'INVALID_TYPE', field, message: `${field} debe ser de tipo ${expected}` }),
  range: (field, min, max) => ({ code: 'OUT_OF_RANGE', field, message: `${field} fuera de rango${min!=null?` (min ${min})`:''}${max!=null?` (max ${max})`:''}` }),
  format: (field, format) => ({ code: 'INVALID_FORMAT', field, message: `${field} no cumple formato ${format}` }),
  cedula: (field='IDNumber') => ({ code: 'INVALID_ID', field, message: `Cédula ecuatoriana inválida` }),
};

export const respondValidation = (res, errors) => {
  return res.status(422).json({ ok: false, errors });
};
