import { getAuthenticatedClient } from '../config/supabase.js';

// --- CONFIGURACIÓN ---

// 1. MAPA DE PRIMARY KEYS
const PK_MAP = {
    'activity': 'ActivityID',
    'activity_media': 'MediaID',
    'attendance': 'AttendanceID',
    'audit_log': 'LogID',
    'employee': 'EmpID',
    'employee_task': 'TaskID',
    'grade': 'GradeID',
    'guardian': 'GuardianID',
    'invoice': 'InvoiceID',
    'notification': 'NotificationID',
    'permission': 'PermissionID',
    'role': 'RoleID',
    'role_permission': 'RolePermissionID',
    'session': 'SessionID',
    'student': 'StudentID',
    'student_guardian': 'StudentGuardianID',
    'student_observation': 'ObservationID',
    'student_payment': 'StudentPaymentID',
    'teacher_payment': 'TeacherPaymentID',
    'user': 'UserID',
    'user_role': 'UserRoleID'
};

// 2. TABLAS CON BORRADO LÓGICO
const LOGICAL_DELETE_TABLES = [
    'activity',
    'employee',
    'grade',
    'guardian',
    'role',
    'student',
    'user'
];

// --- FUNCIONES CRUD ---

export const getAll = async (req, res) => {
    const { resource } = req.params;
    const supabase = getAuthenticatedClient(req.token);

    if (!PK_MAP[resource]) {
        return res.status(400).json({ error: `La tabla '${resource}' no está configurada en la API.` });
    }

    let request = supabase.from(resource).select('*');

    if (LOGICAL_DELETE_TABLES.includes(resource)) {
        if (req.query.includeInactive !== 'true') {
            request = request.eq('IsActive', 1);
        }
    }

    Object.keys(req.query).forEach(key => {
        if (!['includeInactive', 'asc', 'orderBy'].includes(key)) {
            request = request.eq(key, req.query[key]);
        }
    });

    const pk = PK_MAP[resource];
    const orderBy = req.query.orderBy || pk;
    const ascending = req.query.asc === 'true';
    
    request = request.order(orderBy, { ascending });

    const { data, error } = await request;

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

export const getById = async (req, res) => {
    const { resource, id } = req.params;
    const supabase = getAuthenticatedClient(req.token);
    const pk = PK_MAP[resource];

    if (!pk) return res.status(400).json({ error: `Recurso '${resource}' no configurado.` });

    const { data, error } = await supabase
        .from(resource)
        .select('*')
        .eq(pk, id)
        .single();

    if (error) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(data);
};

export const create = async (req, res) => {
    const { resource } = req.params;
    const supabase = getAuthenticatedClient(req.token);

    const { data, error } = await supabase
        .from(resource)
        .insert(req.body)
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
};

export const update = async (req, res) => {
    const { resource, id } = req.params;
    const supabase = getAuthenticatedClient(req.token);
    const pk = PK_MAP[resource];

    if (!pk) return res.status(400).json({ error: `Recurso '${resource}' no configurado.` });

    const { data, error } = await supabase
        .from(resource)
        .update(req.body)
        .eq(pk, id)
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

export const remove = async (req, res) => {
    const { resource, id } = req.params;
    const supabase = getAuthenticatedClient(req.token);
    const pk = PK_MAP[resource];

    if (!pk) return res.status(400).json({ error: `Recurso '${resource}' no configurado.` });

    let result;
    let message;

    if (LOGICAL_DELETE_TABLES.includes(resource)) {
        console.log(`[Soft Delete] Tabla: ${resource}, ID: ${id}`);
        result = await supabase
            .from(resource)
            .update({ IsActive: 0 })
            .eq(pk, id);
        message = 'Registro desactivado correctamente';
    } else {
        console.log(`[Hard Delete] Tabla: ${resource}, ID: ${id}`);
        result = await supabase
            .from(resource)
            .delete()
            .eq(pk, id);
        message = 'Registro eliminado permanentemente';
    }

    if (result.error) return res.status(400).json({ error: result.error.message });
    
    res.json({ success: true, message });
};