const API_URL = 'http://localhost:5000/api';

// Generic API request handler with full logging
const apiRequest = async (endpoint, options = {}) => {
  const method = options.method || 'GET';
  const startTime = Date.now();

  console.groupCollapsed(`📡 API Request → ${method} ${API_URL}${endpoint}`);
  console.log('Headers:', { ...options.headers, 'Content-Type': 'application/json' });
  if (options.body) {
    try {
      console.log('Body:', JSON.parse(options.body));
    } catch {
      console.log('Body:', options.body);
    }
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const responseTime = Date.now() - startTime;
    let data;

    try {
      data = await response.json();
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError);
      throw new Error(`Invalid JSON response from ${endpoint}`);
    }

    if (!response.ok) {
      console.error(
        `🚨 Request failed [${response.status} ${response.statusText}] in ${responseTime}ms`,
        '\nResponse body:',
        data
      );
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    console.log(`✅ Success [${response.status}] in ${responseTime}ms`);
    console.log('Response data:', data);
    console.groupEnd();

    return data;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `🔥 Error during ${method} ${endpoint} (${duration}ms):`,
      error.message || error
    );
    console.groupEnd();

    // Optional: send error to external logging service here
    throw error;
  }
};

/* ======================================================
   USERS API
====================================================== */
export const usuariosAPI = {
  register: (userData) =>
    apiRequest('/usuarios/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    apiRequest('/usuarios/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  verify2FA: (data) =>
    apiRequest('/usuarios/verify-2fa', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  resend2FA: (data) =>
    apiRequest('/usuarios/resend-2fa', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: () =>
    apiRequest('/usuarios', {
      method: 'GET',
    }),

  getById: (id) =>
    apiRequest(`/usuarios/${id}`, {
      method: 'GET',
    }),

  update: (id, userData) =>
    apiRequest(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  delete: (id) =>
    apiRequest(`/usuarios/${id}`, {
      method: 'DELETE',
    }),
};

/* ======================================================
   OFERENTES API
====================================================== */
export const oferentesAPI = {
  create: (oferenteData) =>
    apiRequest('/oferentes', {
      method: 'POST',
      body: JSON.stringify(oferenteData),
    }),

  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    if (filters.estado) queryParams.append('estado', filters.estado);
    if (filters.tipo) queryParams.append('tipo', filters.tipo);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/oferentes?${queryString}` : '/oferentes';
    
    return apiRequest(endpoint, { method: 'GET' });
  },

  getById: (id) =>
    apiRequest(`/oferentes/${id}`, {
      method: 'GET',
    }),

  getByUserId: (userId) =>
    apiRequest(`/oferentes/usuario/${userId}`, {
      method: 'GET',
    }),

  update: (id, oferenteData) =>
    apiRequest(`/oferentes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(oferenteData),
    }),

  updateEstado: (id, estadoData) =>
    apiRequest(`/oferentes/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify(estadoData),
    }),

  delete: (id) =>
    apiRequest(`/oferentes/${id}`, {
      method: 'DELETE',
    }),
};

/* ======================================================
   SERVICIOS API
====================================================== */
export const serviciosAPI = {
  // POST /api/servicios
  create: (data) =>
    apiRequest('/servicios', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // GET /api/servicios → devuelve { servicios: [], stats: {} }
  getAll: () =>
    apiRequest('/servicios'),

  // GET /api/servicios/:id
  getById: (id) =>
    apiRequest(`/servicios/${id}`),

  // GET /api/servicios/oferente/:oferenteId
  getByOferenteId: (oferenteId) =>
    apiRequest(`/servicios/oferente/${oferenteId}`),

  // PUT /api/servicios/:id
  update: (id, data) =>
    apiRequest(`/servicios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // DELETE /api/servicios/:id
  delete: (id) =>
    apiRequest(`/servicios/${id}`, { method: 'DELETE' }),
};
// ---------------------------------------------------------------------
// PRODUCTOS
// ---------------------------------------------------------------------
export const productosAPI = {
  getByOferenteId: (oferenteId) => 
    apiRequest(`/productos/oferente/${oferenteId}`),
  getAll: () => apiRequest('/productos'),
  getMis: () => apiRequest('/productos/mis-productos'),
  create: (data) => apiRequest('/productos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/productos/${id}`, { method: 'DELETE' }),
  getCategorias: (tipo) => apiRequest('/productos/categorias'),
  crearCategoria: (data) => apiRequest('/productos/categorias', { method: 'POST', body: JSON.stringify(data) }),
  actualizarCategoria: (id, data) => apiRequest(`/productos/categorias/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  eliminarCategoria: (id) => apiRequest(`/productos/categorias/${id}`, { method: 'DELETE' }),
};

/* ======================================================
   ORDENES API
====================================================== */
export const ordenesAPI = {
  create: (ordenData) =>
    apiRequest('/ordenes', {
      method: 'POST',
      body: JSON.stringify(ordenData),
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }),

  getMisOrdenes: () =>
    apiRequest('/ordenes/mis-ordenes', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }),

  getOrdenesOferente: () =>
    apiRequest('/ordenes/oferente', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }),

  updateEstado: (id, estado) =>
    apiRequest(`/ordenes/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }),
};

/* ======================================================
   PEDIDOS API
====================================================== */
export const pedidosAPI = {
  // Crear pedido manualmente (raramente usado, PayPal lo hace automáticamente)
  create: (pedidoData) =>
    apiRequest('/pedido', {
      method: 'POST',
      body: JSON.stringify(pedidoData),
    }),

  // Obtener todos los pedidos (admin)
  getAll: () =>
    apiRequest('/pedido', {
      method: 'GET',
    }),

  // Obtener pedido por ID
  getById: (id) =>
    apiRequest(`/pedido/${id}`, {
      method: 'GET',
    }),

  // Obtener mis pedidos (del usuario actual)
  getMisPedidos: () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) throw new Error('Usuario no autenticado');
    
    return apiRequest(`/pedido/usuario/${currentUser.id_usuario}`, {
      method: 'GET',
    });
  },

  // Obtener pedidos por usuario
  getByUsuarioId: (usuarioId) =>
    apiRequest(`/pedidos/usuario/${usuarioId}`, {
      method: 'GET',
    }),

  // Obtener pedidos por oferente (para ver ventas)
  getByOferenteId: (oferenteId) =>
    apiRequest(`/pedidos/oferente/${oferenteId}`, {
      method: 'GET',
    }),

  // Obtener pedidos por estado
  getByEstado: (estado) =>
    apiRequest(`/pedidos/estado/${estado}`, {
      method: 'GET',
    }),

  // Cambiar estado del pedido
  updateEstado: (id, estado) =>
    apiRequest(`/pedidos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }),

  // Eliminar pedido (solo pendientes)
  delete: (id) =>
    apiRequest(`/pedidos/${id}`, {
      method: 'DELETE',
    }),
};

/* ======================================================
   RESERVAS API
====================================================== */
export const reservasAPI = {
  // Crear nueva reserva
  create: (reservaData) =>
    apiRequest('/reservas', {
      method: 'POST',
      body: JSON.stringify(reservaData),
    }),

  // Obtener todas las reservas (admin)
  getAll: () =>
    apiRequest('/reservas', {
      method: 'GET',
    }),

  // Obtener reserva por ID
  getById: (id) =>
    apiRequest(`/reservas/${id}`, {
      method: 'GET',
    }),

  // Obtener reservas por usuario
  getByUsuarioId: (usuarioId) =>
    apiRequest(`/reservas/usuario/${usuarioId}`, {
      method: 'GET',
    }),

  // Obtener mis reservas (usando el usuario actual del localStorage)
  getMisReservas: () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) throw new Error('Usuario no autenticado');
    
    return apiRequest(`/reservas/usuario/${currentUser.id_usuario}`, {
      method: 'GET',
    });
  },

  // Obtener reservas por servicio
  getByServicioId: (servicioId) =>
    apiRequest(`/reservas/servicio/${servicioId}`, {
      method: 'GET',
    }),

  // Obtener reservas por oferente
  getByOferenteId: (oferenteId) =>
    apiRequest(`/reservas/oferente/${oferenteId}`, {
      method: 'GET',
    }),

  // Obtener reservas por estado
  getByEstado: (estado) =>
    apiRequest(`/reservas/estado/${estado}`, {
      method: 'GET',
    }),

  // Actualizar reserva completa
  update: (id, reservaData) =>
    apiRequest(`/reservas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reservaData),
    }),

  // Cambiar solo el estado de una reserva
  updateEstado: (id, estado) =>
    apiRequest(`/reservas/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }),

  // Verificar disponibilidad antes de reservar
  checkDisponibilidad: (id_servicio, fecha, hora) => {
    const params = new URLSearchParams({ id_servicio, fecha, hora });
    return apiRequest(`/reservas/check/disponibilidad?${params.toString()}`, {
      method: 'GET',
    });
  },

  // Eliminar reserva
  delete: (id) =>
    apiRequest(`/reservas/${id}`, {
      method: 'DELETE',
    }),

  // Cancelar reserva (con validación de 24h)
  cancelar: async (id) => {
    // Primero obtener la reserva para validar
    const reserva = await apiRequest(`/reservas/${id}`, { method: 'GET' });
    
    // Validar que falten al menos 24h
    const fechaReserva = new Date(`${reserva.fecha}T${reserva.hora}`);
    const ahora = new Date();
    const horasRestantes = (fechaReserva - ahora) / (1000 * 60 * 60);
    
    if (horasRestantes < 24) {
      throw new Error('No se puede cancelar con menos de 24 horas de anticipación');
    }
    
    // Si pasa la validación, cancelar
    return apiRequest(`/reservas/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: 'cancelada' }),
    });
  },
};

/* ======================================================
   PAYPAL API
====================================================== */
export const paypalAPI = {
  createOrder: (orderData) =>
    apiRequest('/paypal/create-order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  captureOrder: (captureData) =>
    apiRequest('/paypal/capture-order', {
      method: 'POST',
      body: JSON.stringify(captureData),
      // No Authorization header for testing
    }),

  getOrderDetails: (orderID) =>
    apiRequest(`/paypal/orders/${orderID}`),
};

export default usuariosAPI;