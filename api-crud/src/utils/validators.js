
export const isString = (v) => typeof v === 'string' && v.trim().length >= 0;
export const isNumber = (v) => typeof v === 'number' && !isNaN(v);
export const isBoolean = (v) => typeof v === 'boolean' || v === 0 || v === 1;
export const isISODate = (v) => {
  if (!v || typeof v !== 'string') return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
};
export const inRange = (v, { min, max }) => {
  if (!isNumber(v)) return false;
  if (min != null && v < min) return false;
  if (max != null && v > max) return false;
  return true;
};



export const validateCedulaEcuatoriana = (cedula) => {
  const s = String(cedula || '').trim();
  if (!/^\d{10}$/.test(s)) return false;
  const prov = parseInt(s.slice(0, 2), 10);
  if (prov < 1 || prov > 24) return false;
  const tercer = parseInt(s[2], 10);
  if (tercer >= 6) return false;
  const coef = [2,1,2,1,2,1,2,1,2];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let prod = coef[i] * parseInt(s[i], 10);
    if (prod >= 10) prod -= 9;
    sum += prod;
  }
  const dec = (Math.ceil(sum / 10) * 10) - sum;
  const ver = parseInt(s[9], 10);
  return dec === (ver === 10 ? 0 : ver);
};
