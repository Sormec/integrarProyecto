// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
// import ReactPlayer from 'react-player';
// import Link from "next/link";
// import { useRouter } from 'next/navigation';
import { obtenerHistoriasID } from '@/app/services/HistoriaService';
import { Historia }  from '@/app/interfaces/Historia';
// import { UsuarioResumen } from '@/app/interfaces/UsuarioResumen';

interface PostPageProps {
  params: {
    id: number 
  };
}

export default async function UsuarioHistoriaPage({ params }: PostPageProps) {
  const historias: Historia[] = await obtenerHistoriasID(params.id);
  // const sinHistoriasDisponibles = () => {
  //   return (
  //     <div className="flex h-screen items-center justify-center bg-gray-100">
  //       <h2 className="text-gray-500">No hay historias disponibles</h2>
  //     </div>
  //   );
  // }

  // Componente para mostrar historias
  function renderHistorias() {
    if (!historias) {
      return <h2 className="text-red-500">Error al cargar historias</h2>;
    }

    if (historias.length === 0) {
      return <h2 className="text-gray-500">No hay historias disponibles</h2>;
    }

    return (
      <div className="w-full max-w-2xl space-y-4">
        {historias.map((historia) => (
          <div key={historia.id} className="p-4 bg-white rounded-lg shadow-md">
            {historia.imagen && <img src={historia.imagen} alt="Imagen historia" className="w-full h-40 object-cover rounded" />}
            <p className="text-gray-700 mt-2">{historia.texto}</p>
            <small className="text-gray-500">{new Date(historia.fecha_creacion).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center h-screen bg-gray-100 p-4" style={{ backgroundColor: "#e6e7eb" }}>
      <h2 className="text-xl font-bold mb-4">Hola, {historias?.[0]?.usuario_nombre ?? "Usuario"} 👋</h2>
      {renderHistorias()}
    </div>
  );
}
  // const { id } = useParams(); 
  // const [historias, setHistorias] = useState<Historia[]>([]);
  // const [historiasUsuario, setHistoriasUsuario] = useState<Historia[]>([]);
  // const [historiaActual, setHistoriaActual] = useState<Historia | null>(null);
  // const [indiceActual, setIndiceActual] = useState(0);
  // const [temporizador, setTemporizador] = useState(10);
  // const [progreso, setProgreso] = useState(0);
  // const [timerId, setTimerId] = useState<number | null>(null);
  // const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  // const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  // const [barraActiva, setBarraActiva] = useState(false);
  // const router = useRouter();
  
  
  // useEffect(() => {
  //   obtenerUsuarioLogueado(setUsuarioLogueado);
  //   obtenerHistorias(id, setHistorias, setHistoriaActual, setIndiceActual, setUsuarioSeleccionado, setHistoriasUsuario);
  //   setIndiceActual(0);  
  // }, [id]);
  
  // const siguienteHistoria = useCallback(() => {
  //   if (indiceActual + 1 >= historiasUsuario.length) {
  //     router.push('/dashboard/historias');
  //   } else {
  //     const siguienteIndice = (indiceActual + 1) % historiasUsuario.length;
  //     setIndiceActual(siguienteIndice);
  //     setHistoriaActual(historiasUsuario[siguienteIndice]);
  //     setTemporizador(10);
  //     setProgreso(0);
  //     setBarraActiva(false);
  //   }
  // }, [historiasUsuario, indiceActual]);
    
  // useEffect(() => { 
  //   if (historiasUsuario.length > 0 && temporizador === 0) { 
  //     const siguienteIndice = (indiceActual + 1) % historiasUsuario.length; 
  //     setIndiceActual(siguienteIndice); 
  //     setHistoriaActual(historiasUsuario[siguienteIndice]); 
  //     setTemporizador(11); 
  //     setProgreso(100); 
  //     siguienteHistoria();
  //   }
    
  //   // Con 'window' se asegura que la variable que retorne sea number
  //   const id = window.setTimeout(() => { 
  //     if (!barraActiva && temporizador > 0) {
  //       setTemporizador((prev) => prev - 1); 
  //       setProgreso(((11 - (temporizador - 1)) / 10) * 100); 
  //     } 
  //   }, 1000);
  
  //   setTimerId(id);
  //   return () => clearTimeout(id); 
  // }, [temporizador, indiceActual, historiasUsuario, barraActiva, siguienteHistoria]);

  // const anteriorHistoria = () => {
  //   const anteriorIndice = (indiceActual - 1 + historiasUsuario.length) % historiasUsuario.length;
  //   setIndiceActual(anteriorIndice);
  //   setHistoriaActual(historiasUsuario[anteriorIndice]);
  //   setTemporizador(10);
  //   setProgreso(0);
  //   setBarraActiva(false);
  // };
    
  // const manejarVideo = () => { 
  //   setBarraActiva(true); 
  // };
  
  // const manejarVideoPause = () => {
  //   setBarraActiva((prevEstado) => {
  //     if (prevEstado && timerId) {
  //       clearTimeout(timerId);
  //     }
  //     return !prevEstado;
  //   });
  // };

  // const manejarVideoEnd = () => { 
  //   setBarraActiva(false); 
  //   siguienteHistoria();
  // };

  // if (!historiaActual) { 
  //   return <p>Cargando...</p>; 
  // }

  // const calcularTiempoDesdePublicacion = (fechaPublicacion: string): number => { 
  //   const ahora = new Date(); 
  //   const tiempoPublicacion = new Date(fechaPublicacion); 
  //   const diferenciaEnMilisegundos = ahora.getTime() - tiempoPublicacion.getTime(); 
  //   const diferenciaEnHoras = Math.floor(diferenciaEnMilisegundos / (1000 * 60 * 60)); 
  //   return diferenciaEnHoras; 
  // };

  // // Filtramos historias publicadas en las últimas 24 horas por otros usuarios
  // const listaUsuarios = historias
  // .filter((historia: Historia) => {
  //   // Calculamos las horas desde la publicación
  //   const horasDesdePublicacion = calcularTiempoDesdePublicacion(historia.fecha_creacion);
  //   // Filtramos historias publicadas en las últimas 24 horas y que no pertenezcan al usuario logueado
  //   return horasDesdePublicacion <= 24 && historia.usuario_nombre !== usuarioLogueado;
  // })
  // .reduce<UsuarioResumen[]>((acumulador, historia) => {
  //   // Buscar si el usuario ya está en la lista acumulada
  //   const usuarioExistente = acumulador.find((u) => u.usuario === historia.usuario_nombre);

  //   if (usuarioExistente) {
  //     // Si el usuario ya existe, aumentar su contador de historias
  //     usuarioExistente.cantidadHistorias += 1;
  //   } else {
  //     // Si es un nuevo usuario, agregarlo a la lista acumulada
  //     acumulador.push({
  //       usuario: historia.usuario_nombre,
  //       cantidadHistorias: 1,
  //       horasDesdePublicacion: calcularTiempoDesdePublicacion(historia.fecha_creacion),
  //     });
  //   }

  //   return acumulador;
  // }, [])
  // .map(({ usuario, cantidadHistorias, horasDesdePublicacion }) => (
  //   <div key={usuario}>
  //     {/* Nombre del usuario */}
  //     {usuario}
  //     <br />
  //     {/* Cantidad de historias nuevas y horas desde su publicación */}
  //     {cantidadHistorias} nuevas {horasDesdePublicacion} horas.<br />
  //   </div>
  // ));

  // const tiempoDesdePublicacion = calcularTiempoDesdePublicacion(historiaActual.fecha_creacion);
  

  
  // return(
  //   <div className="relative flex h-screen bg-gray-100" style={{ backgroundColor: '#e6e7eb', fontFamily: "'Bitter', serif" }}>
  //     <button className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gray-500 text-white text-2xl
  //     flex justify-center items-center hover:bg-gray-600 shadow-lg"
  //     >
  //       <Link href='/dashboard/historias'>
  //         &times;
  //       </Link>
  //     </button>

  //     <div style={{ width:'25%'}} className="bg-white shadow-md border-r p-6 flex flex-col items-center justify-center space-y-4">
  //       <div className="w-full text-left border-b pb-4 mb-4">
  //         <strong className="block text-lg font-semibold">{usuarioLogueado || 'Usuario Anónimo'}</strong>
  //       </div>
  //       <div className="w-full flex flex-col items-start space-y-2">{listaUsuarios}</div>
  //     </div>

  //     <div className="flex-1 relative flex flex-col justify-between p-6">
  //       <div className="w-full flex space-x-2">
  //         {historiasUsuario.map((_, index) => (
  //           <div style={{backgroundColor: 'black'}} key={index} className="flex-1 h-2 bg-gray-300 rounded-full relative">
  //             <div className="h-full bg-teal-400 rounded-full transition-all duration-1000 linear"
  //               style={{backgroundColor: '#ffffff',width: `${historiasUsuario.length === 1 ? progreso : index === indiceActual ? progreso : 0}%`}}
  //             />
  //           </div>
  //         ))}
  //         <button onClick={manejarVideoPause} className="ml-2 text-gray-500 hover:text-gray-700">
  //           {barraActiva ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />}
  //         </button>
  //       </div>

  //       <div style={{marginTop: '22px', left: '50%', transform: 'translateX(-50%)', position: 'absolute'}}
  //         className="absolute top-10 left-10 bg-white bg-opacity-90 text-black px-4 py-2 rounded shadow-md">
  //         <strong>{historiaActual.usuario_nombre}</strong> - {tiempoDesdePublicacion} horas
  //       </div>

  //       <div style={{marginLeft: '20px', marginRight:'20px'}} className="flex-1 flex items-center justify-center">
  //         {/* Historia Imagen */}
  //         {historiaActual.imagen && !historiaActual.video && (
  //           <img style={{maxHeight: '83.5vh'}} src={historiaActual.imagen} alt="Historia"
  //             className="w-full object-contain rounded shadow-lg"
  //           />
  //         )}
  //         {/* Historia Video */}
  //         {historiaActual.video && (
  //           <div className="w-full h-auto max-h-screen relative">
  //             <ReactPlayer className="react-player" url={historiaActual.video} width="100%" minHeight="auto" playing={barraActiva}
  //               onPlay={manejarVideo} onPause={manejarVideoPause} onEnded={manejarVideoEnd}
  //               style={{maxHeight: '90vh', width: '100%', objectFit: 'contain'}}
  //             />
  //             {historiaActual.texto && (
  //               <p className="absolute flex items-center justify-center text-white px-3 py-1 rounded"
  //               style={{fontSize: '24px', color: historiaActual.colorTexto, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none'}}
  //               >
  //                 {historiaActual.texto}
  //               </p>
  //             )}
  //           </div>
  //         )}
  //         {/* Historia Texto */}
  //         {historiaActual.texto && (
  //           <p className="mt-4 text-center text-gray-600">{historiaActual.texto}</p>
  //         )}
  //       </div>
  //       <button className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" onClick={anteriorHistoria}>
  //         &#9664;
  //       </button>
  //       <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" onClick={siguienteHistoria}>
  //         &#9654;
  //       </button>

  //       {/* Botón Marcar como Favorito */}
  //       {usuarioLogueado !== historiaActual.usuario_nombre && (
  //         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
  //         <button
  //           style={{ width: '200px', marginTop:'-68px' }}
  //           onClick={() => marcarFavorita(historiaActual.id, historiaActual.favorito, setHistorias, setHistoriaActual)}
  //           className={`py-2 mt-4 rounded text-white ${historiaActual.favorito ? 'bg-red-500' : 'bg-gray-500'}`}
  //           disabled={historiaActual.favorito}
  //         >
  //           {historiaActual.favorito ? 'Favorito' : 'Marcar como favorito'}
  //         </button>
  //       </div>
        
  //       )}
  //     </div>
  //   </div>
  // );
