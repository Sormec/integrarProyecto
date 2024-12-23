import { jwtDecode } from 'jwt-decode'; 

const obtenerUsuarioLogueado = () => { 
  const token = document.cookie.split('; ').find(row => row.startsWith('token=')); 
  if (token) { 
    const decodedToken = jwtDecode(token.split('=')[1]); 
    return decodedToken.nombre || decodedToken.id; 
  }
  return null;
};

const obtenerHistoriasFavoritas = async () => {
  try {
    const response = await fetch('http://localhost:3306/api/historiasf', { credentials: 'include' });
    const data = await response.json(); 

    const historiasSinDuplicados = data.filter((value, index, self) =>
      index === self.findIndex((t) => t.id === value.id)
    );
    return historiasSinDuplicados;
  } catch (error) {
    console.error('Error al obtener las historias:', error); 
    return [];
  }
};

const eliminarFavorita = async (id, esFavorito, setHistorias, setHistoriaActual) => {
  try {
    const response = await fetch(`http://localhost:3306/api/historias/favorito/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      setHistorias((prevHistorias) =>
        prevHistorias.filter((historia) => historia.id !== id) // Filtrar la historia eliminada
      );
      setHistoriaActual((prevHistoriaActual) =>
        prevHistoriaActual?.id === id ? null : prevHistoriaActual
      );
      
      return true; 
    } else {
      console.error('Error al eliminar de favoritos:', await response.json());
      return false; 
    }
  } catch (error) {
    console.error('Error al eliminar de favoritos:', error);
    return false; 
  }
};

export { obtenerUsuarioLogueado, obtenerHistoriasFavoritas, eliminarFavorita };
