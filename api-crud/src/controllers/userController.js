import {
  changePasswordService,
  createUserService,
  loginService,
  resetPasswordToIDService,
  updateUserService,
} from '../services/userService.js';

export const createUser = async (req, res) => {
  try {
    const { data, error } = await createUserService(req.body);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
  } catch (error) {
    console.error('Error creando usuario:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await updateUserService(id, req.body);
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Intento de login:', { email });
    const { data, error } = await loginService(email, password);
    if (error) return res.status(401).json({ error: error.message });
    return res.json({ success: true, user: data.user, mustChangePassword: data.mustChangePassword });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { data, error } = await changePasswordService(req.body);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const resetPasswordToID = async (req, res) => {
  try {
    const { data, error } = await resetPasswordToIDService(req.body);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, message: 'Contraseña reseteada a la cédula correctamente' });
  } catch (error) {
    console.error('Error reseteando contraseña a cédula:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
