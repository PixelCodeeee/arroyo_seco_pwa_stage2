import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { oferentesAPI, usuariosAPI } from '../services/api';
import '../styles/auth.css';

function CrearOferente() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id_usuario: '',
    nombre_negocio: '',
    direccion: '',
    tipo: 'restaurante'
  });
  const [horario, setHorario] = useState(''); // Estado para el horario
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await usuariosAPI.getAll();
      const oferentesUsers = response.usuarios.filter(u => u.rol === 'oferente');
      setUsuarios(oferentesUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error al cargar usuarios');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Aquí creamos el objeto completo con el horario
      const dataToSend = {
        ...formData,
        horario_disponibilidad: horario || null  // Incluimos el horario
      };

      // UNA SOLA LLAMADA, con todos los datos
      await oferentesAPI.create(dataToSend);

      alert('Oferente creado exitosamente');
      navigate('/oferentes');
    } catch (err) {
      setError(err.message || 'Error al crear oferente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Crear Oferente</h2>
          <p>Registra un nuevo oferente en el sistema</p>
        </div>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="id_usuario">Usuario (Oferente) *</label>
            <select
              id="id_usuario"
              name="id_usuario"
              value={formData.id_usuario}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona un usuario</option>
              {usuarios.map(usuario => (
                <option key={usuario.id_usuario} value={usuario.id_usuario}>
                  {usuario.nombre} - {usuario.correo}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="nombre_negocio">Nombre del Negocio *</label>
            <input
              type="text"
              id="nombre_negocio"
              name="nombre_negocio"
              value={formData.nombre_negocio}
              onChange={handleChange}
              placeholder="Ej: Restaurante El Arroyo"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tipo">Tipo de Negocio *</label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
            >
              <option value="restaurante">Restaurante</option>
              <option value="artesanal">Artesanal</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="direccion">Dirección</label>
            <textarea
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Calle, número, colonia, ciudad"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="horario_disponibilidad">Horario de Disponibilidad</label>
            <textarea
              id="horario_disponibilidad"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              placeholder={`Lunes a Viernes: 09:00 - 18:00\nSábado: 10:00 - 23:00\nDomingo: Cerrado`}
              rows="5"
              style={{ 
                fontFamily: 'monospace', 
                fontSize: '0.9rem',
                resize: 'vertical'
              }}
            />
            <small style={{ color: '#666', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>
              Escribe el horario como texto libre. Se mostrará exactamente así en la lista.
            </small>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/oferentes')}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creando...' : 'Crear Oferente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CrearOferente;