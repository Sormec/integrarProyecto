export const obtenerUsuarios = async (setUsuarios, solicitudes) => {
  try {
    const response = await fetch('http://localhost:3636/api/no-amigos', { credentials: 'include' });
    const data = await response.json();

    const usuariosFiltrados = data.filter((usuario) => 
      !solicitudes.some((solicitud) => solicitud.nombre_usuario === usuario.nombre)
    );

    setUsuarios(usuariosFiltrados);
  } catch (error) {
    console.error('Error al obtener los usuarios no amigos:', error);
  }
};

export const obtenerSolicitudes = async (setSolicitudes) => {
  try {
    const response = await fetch('http://localhost:3636/api/solicitudes', { credentials: 'include' });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    setSolicitudes(data);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
  }
};

export const enviarSolicitud = async (usuarioActual, amigoId, setUsuarios) => {
  try {
    const response = await fetch('http://localhost:3636/api/enviar-solicitud', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: usuarioActual, amigo_id: amigoId }),
    });

    if (response.ok) {
      alert('Solicitud enviada');
      setUsuarios(prevUsuarios => prevUsuarios.filter(usuario => usuario.id !== amigoId));
    } else {
      const errorData = await response.json();
      alert(`Error: ${errorData.message}`);
    }
  } catch (error) {
    console.error('Error al enviar solicitud:', error);
  }
};