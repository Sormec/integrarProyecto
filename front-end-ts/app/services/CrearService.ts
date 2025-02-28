export const guardarHistoria = async (
    modo: string,
    usuario_id: number, 
    imagenBase64?: string, 
    tipoLetra?: string, 
    fondo?: string, 
    videoUrl?: string, 
    texto?: string, 
    colorTextoI?: string
  ): Promise<boolean> => {
    
    if (!usuario_id) {
      console.error("Error: usuario_id es requerido para guardar una historia.");
      return false;
    }
    
    let varBody = {}; // Inicializa el cuerpo de la petición 
    if (modo == 'foto' || modo == 'texto'){
      varBody = {
        usuario_id,
        imagen: imagenBase64,
        tipoLetra,
        fondo,
        video: null,
        texto,
        colorTextoI
      };
      
    } else if (modo == 'video'){
      varBody = {
        usuario_id,
        imagen: "",
        tipoLetra,
        fondo,
        video: videoUrl,
        texto,
        colorTextoI
      };
    }
  
    try {
      const response = await fetch("http://localhost:3306/api/historias/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(varBody),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error en la subida de historia:", errorData);
        return false;
        
      } else {
        console.log("Arreglo: ", await response.json()); // Se muestra por consola la respuesta
        return true;
      }
  
    } catch (error) {
      console.error("Error al subir la historia:", error);
      return false;
    }
  };
  