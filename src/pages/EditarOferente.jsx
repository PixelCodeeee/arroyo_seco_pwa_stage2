import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { oferentesAPI } from '../services/api';
import '../styles/auth.css';

function EditarOferente() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    nombre_negocio: '',
    direccion: '',
    tipo: 'restaurante'
  });
  const [horario, setHorario] = useState(''); // ← estado para el horario
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOferente();
  }, [id]);

  const fetchOferente = async () => {
    try {
      setFetching(true);
      const oferente = await oferentesAPI.getById(id);
      
      setFormData({
        nombre_negocio: oferente.nombre_negocio,
        direccion: oferente.direccion || '',
        tipo: oferente.tipo
      });

      // Aquí sí puedes usar oferente porque ya lo tienes
      setHorario(oferente.horario_disponibilidad || '');
      
    } catch (err) {
      setError(err.message || 'Error al cargar oferente');
    } finally {
      setFetching(false);
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
      // Enviar TODOS los datos, incluyendo el horario
      await oferentesAPI.update(id, {
        ...formData,
        horario_disponibilidad: horario || null  // ← IMPORTANTE
      });
      
      alert('Oferente actualizado exitosamente');
      navigate('/oferentes');
    } catch (err) {
      setError(err.message || 'Error al actualizar oferente');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="loading">Cargando datos del oferente...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Editar Oferente</h2>
          <p>Actualiza la información del oferente</p>
        </div>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
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
              placeholder='Lunes a Viernes: 09:00 - 18:00\nSábado: 10:00 - 23:00\nDomingo: Cerrado'
              rows="5"
              style={{ 
                fontFamily: 'monospace', 
                fontSize: '0.9rem',
                resize: 'vertical'
              }}
            />
            <small style={{ color: '#666', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>
              Se guardará exactamente como lo escribas. Usa saltos de línea para mejor legibilidad.
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
              {loading ? 'Actualizando...' : 'Actualizar Oferente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarOferente;