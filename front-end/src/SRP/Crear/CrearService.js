const guardarHistoria = async (usuario_id, imagenBase64, videoUrl = null, texto, tipoLetra, fondo, colorTextoI) => {
  const body = {
    usuario_id, imagen: imagenBase64, tipoLetra, fondo, video: videoUrl, texto, colortexto: colorTextoI
  };

  try {
    const response = await fetch('http://localhost:3306/api/historias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      return true;
    } else {
      const data = await response.json();
      console.error('Error en la subida de historia:', data);
      return false;
    }
  } catch (error) {
    console.error('Error al subir la historia:', error);
    return false;
  }
};

export { guardarHistoria };
