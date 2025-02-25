// import { Historia } from "../interfaces/Historia";

export const obtenerHistorias = async (usuario_id: number) => {
    if (!usuario_id) {
        console.error("Error: usuario_id es requerido para obtener historias.");
        return [];
    }

    try {
      const response = await fetch(`http://localhost:3306/api/historias?usuario_id=${usuario_id}`);

      if (!response.ok) {
        throw new Error(`Error al obtener historias. Código: ${response.status}`);
      }
            
      const data = await response.json();
      console.log(data); // Se envia por consola para ver la respuesta
      return data;
    } catch (error) {
      console.error("Error al obtener historias:", error);
      return [];
    }
};

export const obtenerFavoritas = async (usuario_id: number) => {
    if (!usuario_id) {
        console.error("Error: usuario_id es requerido para obtener historias favoritas.");
        return [];
    }

    try {
      const response = await fetch(`http://localhost:3306/api/historias/favoritas?usuario_id=${usuario_id}`);

      if (!response.ok) {
        throw new Error(`Error al obtener historias favoritas. Código: ${response.status}`);
      }
            
      const data = await response.json();
      console.log(data); // Se envia por consola para ver la respuesta
      return data;
    } catch (error) {
      console.error("Error al obtener historias favoritas:", error);
      return [];
    }
};

// Elimina los historias duplicadas, pero eso ya esta resuelto
// const eliminarDuplicados = (arr: Historia[]) => {
//     return arr.filter((item, index, self) => self.findIndex((t) => t.id === item.id) === index);
// };