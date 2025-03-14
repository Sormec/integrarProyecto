"use client"
import { obtenerHistoriasID } from "@/app/services/HistoriaService";
import { Historia } from "@/app/interfaces/Historia";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactPlayer from "react-player";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";

export default function UsuarioHistoriaPage() {
  const params = useParams< {id: string} >(); // En la documentación de Nextjs se instancia así
  const router = useRouter();
  const [historiasUsuario, setHistoriasUsuario] = useState<Historia[]>([]);
  const [historiaActual, setHistoriaActual] = useState<Historia | null>(null);
  const [indiceActual, setIndiceActual] = useState(0); // Indica en que número de historia esta actualmente
  const [temporizador, setTemporizador] = useState(15); // Indica cuanto tiempo durara cada historia (15 seg) similar a 'setTimeout' 
  const [progreso, setProgreso] = useState(0); // Indica el progreso actual cuando se muestra cada historia
  const [barraActiva, setBarraActiva] = useState<boolean>(false); // Indica si la barra de progreso esta en pausa o en reproducción
  const [timerId, setTimerId] = useState<number | null>(null); // Controla el ID de 'setTimeout' para detener para detener y reiniciar el temporizador
  const [tiempoDesdePublicacion, setTiempoDesdePublicacion] =  useState<number | null>(null);

  
  // Configura(Setea) las variables al avanzar en las historias
  const siguienteHistoria = useCallback(() => {
    if (indiceActual + 1 >= historiasUsuario.length) {
      router.push("/historias");
    } else {
      const nuevoIndice = indiceActual + 1;
      setIndiceActual(nuevoIndice);
      setHistoriaActual(historiasUsuario[nuevoIndice]);
      setTemporizador(15);
      setProgreso(0);
      setBarraActiva(false);
    }
  }, [historiasUsuario, indiceActual, router]);
  
  // Configuara las variables al retroceder en las historias
  const anteriorHistoria = () => {
    if (indiceActual === 0) {
      router.push("/historias");
    } else {
      const anteriorIndice = (indiceActual - 1 + historiasUsuario.length) % historiasUsuario.length;
      setIndiceActual(anteriorIndice);
      setHistoriaActual(historiasUsuario[anteriorIndice]);
      setTemporizador(15);
      setProgreso(0);
      setBarraActiva(false);
    }
  };

  // Consulta a la base de datos y guarda la consulta
  useEffect(() => {
    const fetchHistorias = async () => {
      const historias: Historia[] = await obtenerHistoriasID(Number(params.id));
      if (historias.length > 0) {
        setHistoriasUsuario(historias);
        setHistoriaActual(historias[0]);
      }
    };
    fetchHistorias();
  }, [params.id]);
  
  // Maneja los datos del temporizador de cada historia
  useEffect(() => {
    if (historiasUsuario.length > 0 && temporizador === 0) {
      siguienteHistoria(); // Cambia automaticamente a la siguiente historia
    }

    const id = window.setTimeout(() => {
      if (!barraActiva && temporizador > 0) {
        setTemporizador((prev) => prev - 1);
        setProgreso(((16 - (temporizador - 1)) / 15) * 100);
      }
    }, 1000);

    setTimerId(id); // Guarda el ID del temporizador
    
    return () => clearTimeout(id); // Limpia el temporizador anterior antes de crear uno nuevo
  }, [temporizador, barraActiva, siguienteHistoria, historiasUsuario.length]);
  
  // Calcula las horas que han pasado desde que se publico la historia
  const calcularTiempoDesdePublicacion = useCallback((fechaPublicacion: string): number | null => { 
    if (!fechaPublicacion) return null;
    
    const ahora = new Date(); 
    const tiempoPublicacion = new Date(fechaPublicacion);
    // Si la variable no es un número
    if ( isNaN(tiempoPublicacion.getTime()) ) {
      console.error("Fecha de publicación no válida: ", fechaPublicacion);
      return null;
    }

    const diferenciaEnMilisegundos = ahora.getTime() - tiempoPublicacion.getTime(); 
    const diferenciaEnHoras = Math.floor(diferenciaEnMilisegundos / (1000 * 60 * 60)); 
    return diferenciaEnHoras; 
  }, []);

  // Recalcula el tiempo desde la publicación cuando cambia la historia actual
  useEffect(() => {
    if (historiasUsuario.length > 0) {
      const nuevaFecha = historiasUsuario[indiceActual]?.fecha_creacion;
      setTiempoDesdePublicacion(calcularTiempoDesdePublicacion(nuevaFecha));
    }
  }, [indiceActual, historiasUsuario, calcularTiempoDesdePublicacion]);
  
  // Pausa o reanuda la historia
  const manejarVideoPause = () => {
    setBarraActiva((prevEstado) => {
      if (prevEstado && timerId) {
        clearTimeout(timerId); // 'cleartTimeout' funciona como temporizador
      }
      return !prevEstado; // Envia el estado contrario del que tenia (si estaba False envia True)
    });
  };

  if (!historiaActual) {
    return <p>Cargando...</p>;
  }

  
  return (
    <div className="relative flex h-screen bg-gray-100">
      <button className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gray-500 text-white text-2xl
      flex justify-center items-center hover:bg-gray-600 shadow-lg">
        <Link href="/historias"> &times; </Link>
      </button>
        
      <div className="flex-1 relative flex flex-col justify-between p-6">
        {/* Barra de progreso de Historia */}
        <div className="w-full flex space-x-2">
          {historiasUsuario.map((_, index) => (
            <div key={index} className="flex-1 h-2 bg-black rounded-full relative">
              <div
                className="h-full bg-teal-400 rounded-full transition-all duration-1000 linear"
                style={{
                  backgroundColor: "#ffffff",
                  width: `${historiasUsuario.length === 1 ? progreso : index === indiceActual ? progreso : 0}%`,
                }}
              />
            </div>
          ))}
          <button onClick={manejarVideoPause} className="ml-2 text-gray-500 hover:text-gray-700">
            {barraActiva ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />}
          </button>
        </div>

        {/* Visualización del nombre del usuario y hace cuanto tiempo se publico la historia */}
        <div style={{marginTop: '22px', left: '50%', transform: 'translateX(-50%)', position: 'absolute'}}
          className="absolute top-10 left-10 bg-white bg-opacity-90 text-black px-4 py-2 rounded shadow-md">
          <strong>{historiaActual?.usuario_nombre}</strong> - {tiempoDesdePublicacion} horas
        </div>

        <div className="flex-1 flex items-center justify-center bg-white">
          {/* Historia tipo Foto o Texto */}
          {historiaActual?.imagen && !historiaActual.video && (
            <img src={historiaActual.imagen} alt="Historia" className="w-full max-h-[85vh] object-contain rounded shadow-lg" />
          )}
          {/* Historia tipo Video */}
          {historiaActual?.video && (
            <div className="w-full h-auto max-h-screen relative">
              <ReactPlayer
                className="react-player"
                url={historiaActual?.video}
                width="100%"
                playing={barraActiva}
                style={{ maxHeight: "90vh", width: "100%", objectFit: "contain" }}
              />
              {/* Si la Historia tiene un Input de texto lo muestra aquí */}
              {historiaActual.texto && (
                <p className="absolute flex items-center justify-center text-white px-3 py-1 rounded"
                style={{fontSize: '24px', color: historiaActual.colorTexto, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none'}}>
                  {historiaActual.texto}
                </p>
              )}
            </div>
          )}
          {/* Muestra el input de texto de la historia  */}
          {/* {historiaActual.texto && <p className="mt-4 text-center text-gray-600">{historiaActual.texto}</p>} */}
        </div>
        {/* Botones flecha para retroceder o avanzar en las historias */}
        <button className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" onClick={anteriorHistoria}>
          &#9664;
        </button>
        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" onClick={siguienteHistoria}>
          &#9654;
        </button>

      </div>
    </div>
  );
};
