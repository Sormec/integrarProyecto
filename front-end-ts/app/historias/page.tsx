"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { FaPlus } from 'react-icons/fa';
import ReactPlayer from 'react-player';
import { obtenerHistorias, obtenerFavoritas } from '@/app/servicios/HistoriaService';
import { Historia, HistoriasPorUsuarioMap }  from '@/app/interfaces/Historia';

// Definición de interfaces
interface HistoriaPorUsuario {
  usuario: string;
  historia: Historia;
  cantidadHistorias: number;
}

// interface Amigos {
//   id: number;
//   nombre: string;

// }

// Se debe poner siempre 'default function' el nombre no importa mucho
export default function HistoriasPage() {
  const [historias, setHistorias] = useState<Historia[]>([]);
  const [usuarioActual, setUsuarioActual] = useState<string | null>(null);
  // const [amigos, setAmigos] = useState([]);
  const [historiasFavoritas, setHistoriasFavoritas] = useState<Historia[]>([]);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const router = useRouter();

  const scrollIzquierda = () => {
    const container = document.getElementById('historias-container');
    container?.scrollBy({top: 0, left: -300, behavior: 'smooth',});
  };

  const scrollDerecha = () => {
    const container = document.getElementById('historias-container');
    container?.scrollBy({top: 0, left: 300, behavior: 'smooth',});
    setShowLeftButton(true);
  };

  const handleScroll = () => {
    const container = document.getElementById('historias-container');
    if (container?.scrollLeft === 0) {
      setShowLeftButton(false);
    }
  };

  // Agrupa las historias por usuario
  const historiasPorUsuario = (historias: Historia[]): HistoriasPorUsuarioMap => {
    const historiasAgrupadas: HistoriasPorUsuarioMap = {};

    // Recorremos cada historia del array
    historias.forEach((historia) => {
      const nombreUsuario = historia.usuario_nombre;

      // Si es la primera historia del usuario, inicializamos su array
      if (!historiasAgrupadas[nombreUsuario]) {
        historiasAgrupadas[nombreUsuario] = [];
      } 

      // Añadimos la historia al array del usuario
      historiasAgrupadas[nombreUsuario].push(historia);
    });

    return historiasAgrupadas;
  };

  // Obtiene las historias más recientes por usuario
  const historiasMasRecientes = (): HistoriaPorUsuario[] => {
    const historiasPorUsuarioVar = historiasPorUsuario(historias);

    return Object.entries(historiasPorUsuarioVar).map(
      ([usuario, historiasUsuario]): HistoriaPorUsuario => ({
        usuario,
        historia: historiasUsuario[0], // Historia más reciente
        cantidadHistorias: historiasUsuario.length
      })
    );
  };

  // Obtiene las historias ordenadas, primero la de usuario actual
  const historiasOrdenadas = (): HistoriaPorUsuario[] => {
    const historiasRecientes = historiasMasRecientes();
    
    return historiasRecientes.sort((a, b) => 
      a.usuario === usuarioActual ? -1 : b.usuario === usuarioActual ? 1 : 0
    );
  };

  // const irABuscarAmigos = () => {
  //   router.push('/amigos');
  // };

  useEffect(() => {
    const container = document.getElementById('historias-container');
    container?.addEventListener('scroll', handleScroll);
    // ususario_id = 2 es María López
    // ususario_id = 4 es Juan Pérez
    // const varNombre = "Juan Pérez"; // usuario quemado 
    const usuario_id = 4; // Usuario quemado (Juan Pérez)
    const usuario_nombre = "Juan Pérez"; // Nombre quemado

    const fetchData = async () => {
      try {
        const [historiasData, favoritasData] = await Promise.all([
          obtenerHistorias(usuario_id),
          // obtenerAmigos(),
          obtenerFavoritas(usuario_id)
        ])

        setUsuarioActual(usuario_nombre);
        setHistorias(historiasData);
        // setAmigos(amigosData);
        setHistoriasFavoritas(favoritasData);

        // const token = document.cookie
        //   .split('; ')
        //   .find((row) => row.startsWith('token='))?.split('=')[1];
        
        // if (token) {
        //   try {

        //     const decoded = jwtDecode<DecodedToken>(token);
            
        //     if (decoded && decoded.nombre) {
        //       setUsuarioActual(decoded.nombre);
        //     } else {
        //       console.error('El token no contiene el campo nombre');
        //     }
        //   } catch (tokenError) {
        //     console.error('Error al decodificar el token:', tokenError);
        //   }
        // } else {
        //   console.log('No se encontró token en las cookies');
        // }

      } catch (error) {
        console.log('Error al cargar los datos: ', error);
      }
      
    };
    fetchData();

    //Función para limpiar
    // return () => {
    //   container?.removeEventListener('scroll', handleScroll);
    // };
  }, []);


  const VideoPlayer: React.FC<{ url: string; imagen?: string }> = ({ url, imagen }) => {
    return (
      // --@ts-ignore
      <ReactPlayer 
        url={url}
        light={imagen || true}
        width="110px"
        height="130px"
        playing={false}
        controls={false}
        muted={true}
        style={{ 
          objectFit: 'cover',
          maxWidth: '110px',
          maxHeight: '130px'
        }}
      />
    );
  };
  
  const handleCrearHistoria = () => {
    router.push('/dashboard/historias/crear');
  };

  const handleVistaUsuarios = () => {
    router.push(`/dashboard/historias/vista-usuarios/`);
  };


  return (
    <div className="relative min-h-screen text-center" style={{ backgroundColor: '#e6e7eb' }}>
      <img src={"/iconlogo.svg"} alt="Logo" className="mb-5" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />

      {/* flex: alinea los elementos dinamicamente, con lo otro alineara los elementos de manera vertical y horizontal */}
      <div style={{ minWidth: '100%'}} className="flex items-start justify-center w-full"> 
        {/* Sección para Crear historia */}
        <div onClick={handleCrearHistoria} style={{minWidth: '120px', height: '200px', marginTop: '20px',  backgroundColor: '#ffffff', color: '#464543'}}
        className=" rounded-lg mt-6 flex flex-col items-center justify-center px-4 mx-4">
          <button className="p-4 rounded-full mb-3 shadow-lg" style={{background:'#454643', color: '#ffffff' }}>
            <FaPlus size={20}/>
          </button>
          <span style={{color:'#464543'}} className="text-white">Crear historia</span>
        </div>

        {/* Sección de Visualización de historias */}
        {/* w-3/4: usara la cuarta parte del contenedor principal */}
        <div className="flex items-center justify-center w-3/4 relative mx-2">
          {showLeftButton && (
            <button className="btn-historia-left bg-gray-400 w-12 h-12 rounded-full text-lg font-bold flex items-center justify-center cursor-pointer absolute left-0 z-10"
            onClick={scrollIzquierda} style={{ color: '#ffffff',zIndex: 1000}}>
              &lt;
            </button>
          )}
          <div id="historias-container" className="flex overflow-x-hidden scroll-smooth w-full py-5">                
            <div className="flex flex-col justify-center items-center w-15 h-15 box-border historia cursor-pointer">
                {historiasFavoritas.length -1 > 0 && (
                    <div style={{ minWidth: '120px', height: '200px', marginRight: '8px' }}
                    className="relative flex flex-col justify-center items-center w-15 h-15 box-border historia cursor-pointer">
                        <div style={{ border: '2px solid #464543', backgroundColor: '#ffffff', color: '#464543', marginLeft: '5px' }} className="flex flex-col items-center">
                            {historiasFavoritas.slice(0, 1).map((historia: Historia) => (
                                <div key={historia.id} style={{ maxWidth: '120px', height: '200px', position: 'relative', overflow: 'hidden' }}
                                className="flex flex-col justify-between items-center w-15 h-15 p-2 box-border historia cursor-pointer"
                                onClick={() => router.push(`/Vista_Favoritos/${historia.id}`)}>
                                    <div className="absolute inset-0 bg-cover bg-center blur-sm"
                                    style={{backgroundImage: `url(${historia.imagen || ''})`, filter: 'blur(8px)', zIndex: 1}}>
                                    </div>

                                    <div className="relative z-10 flex flex-col items-center justify-center h-full">
                                      <div className="w-full mt-2 mb-2">
                                            <div style={{ maxWidth: '180px' }} className="flex space-x-1">
                                            {Array.from({ length: historiasFavoritas.length }).map((_, index) => (
                                                <div key={index} className="flex-1 h-1 bg-blue-600 rounded"
                                                style={{ background: '#464543', marginRight: index === historiasFavoritas.length - 1 ? '0' : '0px' }}
                                                ></div>
                                            ))}
                                            </div>
                                        </div>
                                        {historia.imagen && (
                                            <div className="flex items-center justify-center h-full w-full">
                                            <img style={{maxHeight: '130px', width:'100%'}} src={historia.imagen} alt="Historia" className="max-h-full max-w-full object-contain"/>
                                            </div>
                                        )}
                                        {/* {historia.video && (
                                            <div className="flex items-center justify-center h-full w-full">
                                            <ReactPlayer 
                                                url={historia.video}
                                                light={historia.imagen || true}
                                                width="110px"
                                                height="130px"
                                                playing={false}
                                                controls={false}
                                                muted={true}
                                                style={{ objectFit: 'cover', maxWidth: '110px', maxHeight: '130px' }}
                                                />

                                            
                                            <p className="absolute text-center px-2 py-1 rounded" style={{ color: historia.colortexto, userSelect: 'none' }}>
                                                {historia.texto}
                                            </p>
                                            </div>
                                        )} */}
                                        {historia.video && (
                                            <div className="flex items-center justify-center h-full w-full">
                                                <VideoPlayer url={historia.video} imagen={historia.imagen} />
                                                <p className="absolute text-center px-2 py-1 rounded" 
                                                style={{ color: historia.colortexto || 'black', userSelect: 'none' }}>
                                                {historia.texto}
                                                </p>
                                            </div>
                                        )}

                                        <h2 style={{ color: 'white', fontSize: '11px' }} className="text-lg font-semibold">Historias Favoritas</h2>
                                        </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {historiasOrdenadas().map(({ usuario, historia, cantidadHistorias }) => (
              <div key={usuario} style={{ border: '2px solid #464543' }} className="relative flex flex-col items-center mx-2">
                <div style={{ maxWidth: '120px', height: '200px', position: 'relative', overflow: 'hidden' }}
                  className="flex flex-col justify-between items-center w-15 h-15 border border-gray-300 p-2 box-border historia cursor-pointer"
                  onClick={() => handleVistaUsuarios()}>  
                  <div className="absolute inset-0 bg-cover bg-center blur-sm" style={{backgroundImage: `url(${historia.imagen || ''})`,
                  filter: 'blur(8px)',zIndex: 1,}}></div>
                  <div  style={{ minWidth: '100px' }} className="relative z-10 flex flex-col items-center justify-center h-full">
                    <div className="w-full mt-2 mb-2">
                      <div style={{ maxWidth: '180px' }} className="flex space-x-1">
                        {Array.from({ length: cantidadHistorias }).map((_, index) => (
                          <div key={index} className="flex-1 h-1 bg-blue-600 rounded"
                            style={{ background: '#464543', marginRight: index === cantidadHistorias - 1 ? '0' : '0px' }}
                          ></div>
                        ))}
                      </div>
                    </div>
                    {historia.imagen && (
                      <div className="flex items-center justify-center h-full w-full">
                        <img style={{maxHeight: '130px', width:'100%'}} src={historia.imagen} alt="Historia" className="max-h-full max-w-full object-contain"/>
                      </div>
                    )}
                    {historia.video && (
                      <div className="flex items-center justify-center h-full w-full">
                        <ReactPlayer url={historia.video} light={historia.imagen || true} style={{ objectFit: 'cover', maxWidth: '110px', maxHeight: '130px' }}
                          playing={false}/>
                        <p className="absolute text-center px-2 py-1 rounded" style={{ color: historia.colortexto, userSelect: 'none' }}>
                          {historia.texto}
                        </p>
                      </div>
                    )}
                    <strong style={{color:'Black', fontSize: '15px'}} className="mt-auto text-lg nombres_U text-white">
                      {usuario === usuarioActual ? 'Tu historia' : historia.usuario_nombre}
                    </strong>
                  </div>
                </div>
              </div>
            ))}

          </div>
          <button className="bg-gray-400 w-12 h-12 rounded-full text-lg font-bold flex items-center justify-center cursor-pointer absolute right-0"
            onClick={scrollDerecha} style={{ color: '#ffffff',zIndex: 1000, }}>
              &gt;
          </button>
        </div>
        {/* Seccion de Amigos */}
        {/* md: es para pantallas medianas (tablets) */}
        {/* <div style={{marginLeft:'10px', minWidth: '165px', marginTop: '20px' }} className="p-4 rounded hidden lg:block w-1/4 mx-4">
          <button style={{ backgroundColor: '#ffffff', color: '#464543'}} onClick={irABuscarAmigos} className="p-2 rounded mb-4">
            Buscar amigos
          </button>
          <h2 className="font-bold text-lg mb-2">Tus amigos</h2>
          <ul> {amigos.map((amigo: Amigos) => (<li key={amigo.id} className="my-2">{amigo.nombre}</li>))}</ul>
        </div> */}
      </div>
    </div>
  );
}
