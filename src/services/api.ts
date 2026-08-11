const API_URL = 'http://localhost:5000/api';

export const api = {
  // --- AUTENTICACIÓN Y PERFIL ---
  login: async (data: { username: string; password: string }) => {
    const res = await fetch(`${API_URL}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Credenciales inválidas');
    }
    return res.json();
  },

  getUserProfile: async () => {
    const res = await fetch(`${API_URL}/user/profile`);
    if (!res.ok) throw new Error('Error al obtener perfil de usuario');
    return res.json();
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const res = await fetch(`${API_URL}/user/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al cambiar la contraseña');
    }
    return res.json();
  },

  // --- DATOS DEL NEGOCIO ---
  getBusinessConfig: async () => {
    const res = await fetch(`${API_URL}/business`);
    if (!res.ok) throw new Error('Error al obtener datos del negocio');
    return res.json();
  },

  updateBusinessConfig: async (data: {
    name: string;
    nit: string;
    address: string;
    phone: string;
    receiptFooter?: string;
  }) => {
    const res = await fetch(`${API_URL}/business`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar datos del negocio');
    return res.json();
  },

  // --- REPORTES ---
  getReportSummary: async () => {
    const res = await fetch(`${API_URL}/reports/summary`);
    if (!res.ok) throw new Error('Error al obtener datos del reporte');
    return res.json();
  },

  // --- ABONADOS ---
  getSubscribers: async () => {
    const res = await fetch(`${API_URL}/subscribers`);
    if (!res.ok) throw new Error('Error al obtener abonados');
    return res.json();
  },

  createSubscriber: async (data: {
    clientName: string;
    phone?: string;
    plate: string;
    vehicleType: string;
    startDate: string;
    endDate: string;
    monthlyFee: number;
    paymentMethod?: string;
  }) => {
    const res = await fetch(`${API_URL}/subscribers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al guardar el abonado');
    }
    return res.json();
  },

  deleteSubscriber: async (id: number) => {
    const res = await fetch(`${API_URL}/subscribers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar abonado');
    return res.json();
  },

  // --- CAJA Y TURNOS ---
  getActiveShift: async () => {
    const res = await fetch(`${API_URL}/shifts/active`);
    if (!res.ok) throw new Error('Error al consultar estado de caja');
    return res.json();
  },

  openShift: async (data: { initialCash: number; operatorUsername?: string }) => {
    const res = await fetch(`${API_URL}/shifts/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al abrir turno');
    return res.json();
  },

  addExpense: async (amount: number) => {
    const res = await fetch(`${API_URL}/shifts/expense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error('Error al registrar el gasto');
    return res.json();
  },

  closeShift: async (declaredCash: number) => {
    const res = await fetch(`${API_URL}/shifts/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ declaredCash }),
    });
    if (!res.ok) throw new Error('Error al cerrar turno');
    return res.json();
  },

  // --- TARIFAS ---
  getRates: async () => {
    const res = await fetch(`${API_URL}/rates`);
    if (!res.ok) throw new Error('Error al obtener tarifas');
    return res.json();
  },

  createRate: async (data: { vehicleType: string; rateType: string; pricePerHour: number }) => {
    const res = await fetch(`${API_URL}/rates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear tarifa');
    return res.json();
  },

  updateRate: async (id: number, data: { vehicleType: string; rateType: string; pricePerHour: number }) => {
    const res = await fetch(`${API_URL}/rates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar tarifa');
    return res.json();
  },

  deleteRate: async (id: number) => {
    const res = await fetch(`${API_URL}/rates/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar tarifa');
    return res.json();
  },

  // --- SESIONES Y AUDITORÍA ---
  getActiveSessions: async () => {
    const res = await fetch(`${API_URL}/sessions/active`);
    if (!res.ok) throw new Error('Error al obtener vehículos');
    return res.json();
  },

  registerEntry: async (data: { plate: string; vehicleType: string; rateType: string; spotName?: string }) => {
    const res = await fetch(`${API_URL}/sessions/entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al registrar entrada');
    return res.json();
  },

  registerExit: async (data: { id: number; totalAmount: number; paymentMethod: string }) => {
    const res = await fetch(`${API_URL}/sessions/exit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al registrar salida');
    return res.json();
  },

  annulSession: async (data: { id: number; annulmentReason: string }) => {
    const res = await fetch(`${API_URL}/sessions/annul`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al anular sesión');
    return res.json();
  },

  getAuditLogs: async () => {
    const res = await fetch(`${API_URL}/audit`);
    if (!res.ok) throw new Error('Error al consultar auditoría');
    return res.json();
  },

  addAuditLog: async (action: string, username: string, details: string) => {
    await fetch(`${API_URL}/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, username, details }),
    });
  }
};