export const obtenerHistorias = async () => {
  try {
    const response = await fetch('http://localhost:3636/api/historias', { credentials: 'include' });
    if (!response.ok) throw new Error('Error al obtener historias');
    const data = await response.json();
    return eliminarDuplicados(data);
  } catch (error) {
    console.error('Error al obtener historias:', error);
    return [];
  }
};

export const obtenerAmigos = async () => {
  try {
    const response = await fetch('http://localhost:3636/api/amigos', { credentials: 'include' });
    if (!response.ok) throw new Error('Error al obtener amigos');
    const data = await response.json();
    return eliminarDuplicados(data);
  } catch (error) {
    console.error('Error al obtener amigos:', error);
    return [];
  }
};

export const obtenerFavoritas = async () => {
  try {
    const response = await fetch('http://localhost:3636/api/historiasf', { credentials: 'include' });
    if (!response.ok) throw new Error('Error al obtener historias favoritas');
    const data = await response.json();
    return eliminarDuplicados(data);
  } catch (error) {
    console.error('Error al obtener historias favoritas:', error);
    return [];
  }
};

// Función para eliminar duplicados basándose en el ID
const eliminarDuplicados = (arr) => {
  return arr.filter((item, index, self) => self.findIndex((t) => t.id === item.id) === index);
};
