import { jwtDecode } from 'jwt-decode'; 

export const obtenerUsuarioLogueado = (setUsuarioLogueado) => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='));
  if (token) {
    const decodedToken = jwtDecode(token.split('=')[1]);
    setUsuarioLogueado(decodedToken.nombre || decodedToken.id);
  }
};

export const obtenerHistorias = async (id, setHistorias, setHistoriaActual, setIndiceActual, setUsuarioSeleccionado, setHistoriasUsuario) => {
  try {
    const response = await fetch('http://localhost:3636/api/historias', { credentials: 'include' });
    const data = await response.json();
    const historiasSinDuplicados = data.filter((value, index, self) =>
      index === self.findIndex((t) => t.id === value.id)
    );
    setHistorias(historiasSinDuplicados);

    const historiaSeleccionada = historiasSinDuplicados.find(h => h.id === parseInt(id));
    if (historiaSeleccionada) {
      setUsuarioSeleccionado(historiaSeleccionada.usuario_nombre);

      const historiasDelUsuario = historiasSinDuplicados.filter(
        h => h.usuario_nombre === historiaSeleccionada.usuario_nombre
      );

      setHistoriasUsuario(historiasDelUsuario);
      setIndiceActual(0);
      setHistoriaActual(historiasDelUsuario[0]);
    }
  } catch (error) {
    console.error('Error al obtener las historias:', error);
  }
};

export const marcarFavorita = async (id, esFavorito, setHistorias, setHistoriaActual) => {
  try {
    const response = await fetch(`http://localhost:3636/api/historias/favorito/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorito: !esFavorito }),
      credentials: 'include',
    });

    const data = await response.json();

    if (response.ok) {
      // Actualiza la lista de historias y la historia actual
      setHistorias((prevHistorias) =>
        prevHistorias.map((historia) =>
          historia.id === id ? { ...historia, favorito: !esFavorito } : historia
        )
      );

      setHistoriaActual((prevHistoriaActual) =>
        prevHistoriaActual?.id === id
          ? { ...prevHistoriaActual, favorito: !esFavorito }
          : prevHistoriaActual
      );
    } else if (data.message === 'Esta historia ya está en tus favoritos') {
      // Muestra un mensaje claro al usuario
      alert('Esta historia ya está marcada como favorita.');
    } else {
      console.error('Error al marcar como favorita:', data);
    }
  } catch (error) {
    console.error('Error al marcar como favorita:', error);
  }
};
