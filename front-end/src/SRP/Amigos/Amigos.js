import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { obtenerUsuarios, obtenerSolicitudes, enviarSolicitud } from './AmigosService';

export const Amigos = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const navigate = useNavigate();

  const obtenerUsuarioActual = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];
    const decodedToken = jwtDecode(token);
    setUsuarioActual(decodedToken.id);
  };

  useEffect(() => {
    obtenerUsuarioActual();
  }, []);

  useEffect(() => {
    if (usuarioActual) {
      obtenerUsuarios(setUsuarios, solicitudes);
      obtenerSolicitudes(setSolicitudes);
    }
  }, [usuarioActual, solicitudes]);

  const aceptarSolicitud = async (solicitudId) => {
    try {
      const response = await fetch(`http://localhost:3636/api/aceptar-solicitud`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ solicitud_id: solicitudId }),
      });
  
      if (response.ok) {
        alert('Solicitud aceptada');
        setSolicitudes(prevSolicitudes =>
          prevSolicitudes.filter(solicitud => solicitud.id !== solicitudId)
        );
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error al aceptar solicitud:', error);
    }
  };
  
  const rechazarSolicitud = async (solicitudId) => {
    try {
      const response = await fetch('http://localhost:3636/api/rechazar-solicitud', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ solicitud_id: solicitudId }),
      });
  
      if (response.ok) {
        alert('Solicitud rechazada');
        setSolicitudes((prevSolicitudes) =>
          prevSolicitudes.filter((solicitud) => solicitud.id !== solicitudId)
        );
      } else {
        alert('Error al rechazar la solicitud');
      }
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
    }
  };
  
  return (
    <div className="p-6 bg-[#464543] min-h-screen font-bitter" style={{ backgroundColor: '#e6e7eb', fontFamily: "'Bitter', serif" }}>
      <button style={{background:'#ffffff', color:'#464543'}} className="absolute top-2 left-2 w-10 h-10 rounded-full text-xl font-bold text-center leading-10 transition-colors duration-300" onClick={() => navigate('/historias')}>X</button>
      <h1 className="text-2xl font-bold text-[#464543] mb-6">Solicitudes de amistad</h1>
      <div className="mb-10">
        {solicitudes.length > 0 ? (
          <div className="flex flex-wrap gap-6">
            {solicitudes.map((solicitud) => (
              <div key={solicitud.id} style={{width:'150px',height:'250px'}} 
                className="bg-white border border-gray-300 rounded-lg shadow-md p-4 flex flex-col justify-between items-center"
              >
                <p className="text-lg font-medium text-gray-700 text-center">{solicitud.nombre_usuario}</p>
                <div className="flex flex-col gap-3 w-full">
                  <button onClick={() => aceptarSolicitud(solicitud.id)} style={{background:'#464543'}}
                    className="text-white py-2 rounded-lg shadow-sm hover:bg-green-600"
                  >
                    Confirmar
                  </button>
                  <button onClick={() => rechazarSolicitud(solicitud.id)} style={{background:'#CACCD4'}}
                    className="bg-red-500 text-white py-2 rounded-lg shadow-sm hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-black">No hay solicitudes.</p>
        )}
      </div>
      <h1 className="text-2xl font-bold text-[#464543] mb-6">Personas que quizá conozcas</h1>
      <div className="mb-10">
        {usuarios.length > 0 ? (
          <div className="flex flex-wrap gap-5">
            {usuarios.map((usuario) => (
              <div key={usuario.id} style={{width:'150px',height:'250px'}}
                className="bg-white border border-gray-300 rounded-lg shadow-md p-4 flex flex-col justify-between items-center"
              >
                <p className="text-lg font-medium text-gray-700 text-center">
                  {usuario.nombre}
                </p>
                <button style={{background:'#464543'}} onClick={() => enviarSolicitud(usuarioActual, usuario.id, setUsuarios)}
                  className="text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-600"
                  disabled={solicitudes.some((solicitud) => solicitud.nombre_usuario === usuario.nombre)}
                >
                  Agregar a amigos
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No hay usuarios disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default Amigos;
