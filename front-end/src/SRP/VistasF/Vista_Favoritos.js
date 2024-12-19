import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import ReactPlayer from 'react-player';
import { obtenerUsuarioLogueado, obtenerHistoriasFavoritas, eliminarFavorita} from './VistaFService'; // Importamos los servicios

export const VistaFavoritos = () => {
  const [historiasFavoritas, setHistoriasFavoritas] = useState([]);
  const [historiaActual, setHistoriaActual] = useState(null);
  const [indiceActual, setIndiceActual] = useState(0);
  const [temporizador, setTemporizador] = useState(10);
  const [progreso, setProgreso] = useState(0);
  const [timerId, setTimerId] = useState(null);
  const navigate = useNavigate();
  const [usuarioLogueado, setUsuarioLogueado] = useState(null); 
  // eslint-disable-next-line no-unused-vars
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null); 
  const [barraActiva, setBarraActiva] = useState(false);

  const obtenerHistorias = useCallback(async () => {
    const historias = await obtenerHistoriasFavoritas();
    setHistoriasFavoritas(historias);
    setHistoriaActual(historias[0]);
    setUsuarioSeleccionado(historias[0]?.usuario_nombre);
  }, []);

  useEffect(() => {
    setUsuarioLogueado(obtenerUsuarioLogueado());
    obtenerHistorias();
  }, [obtenerHistorias]);

  useEffect(() => {
    if (temporizador === 0) {
      if (!barraActiva) {
        if (indiceActual === historiasFavoritas.length - 1) {
          navigate('/historias');
        } else {
          const siguienteIndice = (indiceActual + 1) % historiasFavoritas.length;
          setIndiceActual(siguienteIndice);
          setHistoriaActual(historiasFavoritas[siguienteIndice]);
          setTemporizador(10);
          setProgreso(100);
        }
      }
    }
  }, [temporizador, indiceActual, historiasFavoritas, barraActiva, navigate]);
  
  useEffect(() => {
    if (!barraActiva && temporizador > 0) {
      const id = setTimeout(() => {
        setTemporizador(prev => prev - 1);
        setProgreso(((11-(temporizador - 1)) / 10) * 100);
      }, 1000);
      setTimerId(id);
      return () => clearTimeout(id);
    }
  }, [temporizador, barraActiva]);
  
  const siguienteHistoria = useCallback(() => {
    if (indiceActual + 1 >= historiasFavoritas.length) {
      navigate('/historias'); 
    } else {
    const siguienteIndice = (indiceActual + 1) % historiasFavoritas.length;
    setIndiceActual(siguienteIndice);
    setHistoriaActual(historiasFavoritas[siguienteIndice]);
    setTemporizador(10);
    setProgreso(0);
    setBarraActiva(false);
    }
  },[navigate,historiasFavoritas,indiceActual]);
  
  const anteriorHistoria = () => {
    const anteriorIndice = (indiceActual - 1 + historiasFavoritas.length) % historiasFavoritas.length;
    setIndiceActual(anteriorIndice);
    setHistoriaActual(historiasFavoritas[anteriorIndice]);
    setTemporizador(10);
    setProgreso(0);
    setBarraActiva(false);
  };
  
  const manejarVideo = () => {
    setBarraActiva(true);
  };

  const manejarVideoPause = () => {
    setBarraActiva((prevEstado) => {
      if (prevEstado) {
        clearTimeout(timerId);
      }
      return !prevEstado;
    });
  };

  const manejarVideoEnd = () => {
    setBarraActiva(false);
    siguienteHistoria();
  };

  if (!historiaActual) { 
    return <p>Cargando...</p>; 
  }

  const calcularTiempoDesdePublicacion = (fechaPublicacion) => { 
    const ahora = new Date(); 
    const tiempoPublicacion = new Date(fechaPublicacion); 
    const diferenciaEnMilisegundos = ahora - tiempoPublicacion; 
    const diferenciaEnHoras = Math.floor(diferenciaEnMilisegundos / (1000 * 60 * 60)); 
    return diferenciaEnHoras; 
  };

  const listaUsuarios = historiasFavoritas.filter(historia => {
    const horasDesdePublicacion = calcularTiempoDesdePublicacion(historia.fecha_publicacion);
    return horasDesdePublicacion <= 24 && historia.usuario_nombre !== usuarioLogueado;
  })
  .reduce((acumulador, historia) => {
    const usuario = acumulador.find(u => u.usuario === historia.usuario_nombre);
    if (usuario) {
      usuario.total_historias += 1;
    } else {
      acumulador.push({usuario: historia.usuario_nombre, total_historias: 1,
        horasDesdePublicacion: calcularTiempoDesdePublicacion(historia.fecha_publicacion),
      });
    }
    return acumulador;
  }, [])
  .map(({ usuario, total_historias, horasDesdePublicacion }) => (
    <div key={usuario}>
      {usuario}
      <br />
      {total_historias} nuevas {horasDesdePublicacion} horas.<br />
    </div>
  ));
  const tiempoDesdePublicacion = calcularTiempoDesdePublicacion(historiaActual.fecha_publicacion);

  return (
    <div className="relative flex h-screen bg-gray-100" style={{ backgroundColor: '#e6e7eb', fontFamily: "'Bitter', serif" }}>
      <button onClick={() => navigate('/historias')}
      className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gray-500 text-white text-2xl flex justify-center items-center hover:bg-gray-600 shadow-lg"
      >
        &times;
      </button>
  
      <div style={{ width:'25%'}} className="bg-white shadow-md border-r p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-full text-left border-b pb-4 mb-4">
          <strong className="block text-lg font-semibold">{usuarioLogueado || 'Usuario Anónimo'}</strong>
        </div>
        <div className="w-full flex flex-col items-start space-y-2">{listaUsuarios}</div>
      </div>

      <div className="flex-1 relative flex flex-col justify-between p-6">
        <div className="w-full flex space-x-2">
          {historiasFavoritas.map((_, index) => ( 
            <div style={{backgroundColor: 'black'}} key={index} className="flex-1 h-2 bg-gray-300 rounded-full relative">
              <div className="h-full bg-teal-400 rounded-full transition-all duration-1000 linear"
                style={{backgroundColor: '#ffffff',width: `${index === indiceActual ? progreso : 0}%` }} 
              /> 
            </div> 
          ))}
          <button onClick={manejarVideoPause} className="ml-2 text-gray-500 hover:text-gray-700">
            {barraActiva ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />}
          </button>
        </div>
        <div style={{marginTop: '22px', left: '50%', transform: 'translateX(-50%)', position: 'absolute'}}
          className="absolute top-10 left-10 bg-white bg-opacity-90 text-black px-4 py-2 rounded shadow-md">
          <strong>{historiaActual.usuario_nombre}</strong> - {tiempoDesdePublicacion} horas
        </div>
        <div style={{marginLeft: '20px', marginRight:'20px'}} className="flex-1 flex items-center justify-center">
          {historiaActual.imagen && !historiaActual.video && (
            <img style={{maxHeight: '83.5vh'}} src={historiaActual.imagen} alt="Historia"
              className="w-full object-contain rounded shadow-lg"
            />
          )}
          {historiaActual.video && (
            <div className="w-full h-auto max-h-screen relative">
              <ReactPlayer className="react-player" url={historiaActual.video} width="100%" minHeight="auto" playing={barraActiva} onPlay={manejarVideo}
                onPause={manejarVideoPause} onEnded={manejarVideoEnd} style={{maxHeight: '90vh', width: '100%', objectFit: 'contain'}}
              />
              {historiaActual.texto && (
                <p className="absolute flex items-center justify-center text-white px-3 py-1 rounded"
                style={{fontSize: '24px', color: historiaActual.colortexto, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none'}}
                >
                  {historiaActual.texto}
                </p>
              )}
            </div>
          )}
          {historiaActual.descripcion && (<p className="mt-4 text-center text-gray-600">{historiaActual.descripcion}</p>)}
        </div>
        <button className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          onClick={anteriorHistoria}
        >
          &#9664;
        </button>
        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          onClick={siguienteHistoria}
        >
          &#9654;
        </button>
        <button className={`absolute bottom-10 left-1/2 transform -translate-x-1/2 shadow text-white ${
          historiaActual.favorito ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'
          }`}
          style={{ width: '200px', height: '40px', lineHeight: '40px', textAlign: 'center', borderRadius: '8px' }}
          onClick={async () => {
            const resultado = await eliminarFavorita(historiaActual.id, historiaActual.favorito, setHistoriasFavoritas, setHistoriaActual);
            if (resultado) {
              navigate('/historias'); 
            }
          }}
        >
          Quitar de Favoritos
        </button>
      </div> 
    </div> 
  );
};

export default VistaFavoritos;
