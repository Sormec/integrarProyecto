import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaPlus } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import ReactPlayer from 'react-player';
import { obtenerHistorias, obtenerAmigos, obtenerFavoritas } from './HistoriasService';
import logo from '../../assets/Logo.png';
import './style.css';

export const Historias = () => {
  const [historias, setHistorias] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const navigate = useNavigate();
  const [amigos, setAmigos] = useState([]);
  const [historiasFavoritas, setHistoriasFavoritas] = useState([]);
  const [showLeftButton, setShowLeftButton] = useState(false);
  
  const cerrarSesion = () => {
    document.cookie = 'token=; Max-Age=0; path=/;';
    navigate('/');
  };

  const scrollIzquierda = () => {
    const container = document.getElementById('historias-container');
    container.scrollBy({top: 0, left: -300, behavior: 'smooth',});
  };

  const scrollDerecha = () => {
    const container = document.getElementById('historias-container');
    container.scrollBy({top: 0, left: 300, behavior: 'smooth',});
    setShowLeftButton(true);
  };

  const handleScroll = () => {
    const container = document.getElementById('historias-container');
    if (container.scrollLeft === 0) {
      setShowLeftButton(false);
    }
  };

  const historiasPorUsuario = historias.reduce((acc, historia) => {
    if (!acc[historia.usuario_nombre]) {
      acc[historia.usuario_nombre] = [];
    }
    acc[historia.usuario_nombre].push(historia);
    return acc;
  }, {});

  let historiasMasRecientes = Object.entries(historiasPorUsuario).map(([usuario, historiasUsuario]) => {
    const historiaMasReciente = historiasUsuario[0];
    const cantidadHistorias = historiasUsuario.length;
    return { usuario, historia: historiaMasReciente, cantidadHistorias };
  });

  historiasMasRecientes = historiasMasRecientes.sort((a, b) => 
    a.usuario === usuarioActual ? -1 : b.usuario === usuarioActual ? 1 : 0
  );

  const irABuscarAmigos = () => {
    navigate('/amigos');
  };

  useEffect(() => {
    const container = document.getElementById('historias-container');
    container.addEventListener('scroll', handleScroll);
    const fetchData = async () => {
      const historiasData = await obtenerHistorias();
      const amigosData = await obtenerAmigos();
      const favoritasData = await obtenerFavoritas();
      setHistorias(historiasData);
      setAmigos(amigosData);
      setHistoriasFavoritas(favoritasData);

      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))?.split('=')[1];
      if (token) {
        const decoded = jwtDecode(token);
        setUsuarioActual(decoded.nombre);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="relative min-h-screen text-center" style={{ backgroundColor: '#e6e7eb', fontFamily: "'Bitter', serif" }}>
      <img src={logo} alt="Logo" className="mb-5 mx-2" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
      <button className="btn-cerrar-sesion absolute top-4 right-4 p-2 rounded-full shadow-lg transition duration-300"
      onClick={cerrarSesion}
      >
        <FaSignOutAlt className="text-xl cerrar-sesion-icon"/>
      </button>
      {/* flex: alinea los elementos dinamicamente, con lo otro alineara los elementos de manera vertical y horizontal */}
      <div className="contenedor-principal flex items-start justify-center"> 
        <div onClick={() => navigate('/crear-historia')} className="contenedor-historia rounded-lg mt-6 flex flex-col items-center justify-center px-2 mx-2">
          <button className="btn-crear-historia p-3 rounded-full mb-2">
            <FaPlus size={20}/>
          </button>
          <span className='texto-crear-historia'>Crear historia</span>
        </div>
        {/* w-3/4: usara la cuarta parte del contenedor principal */}
        <div className="flex items-center justify-center w-3/4 relative mx-1">
          {showLeftButton && (
            <button className="btn-historia-left bg-gray-400 w-12 h-12 rounded-full text-lg font-bold flex items-center justify-center cursor-pointer absolute left-0 z-10"
            onClick={scrollIzquierda}
            >
              &lt;
            </button>
          )}
          <div id="historias-container" style={{ maxWidth: '100%' }} className="flex overflow-x-hidden scroll-smooth w-full py-5 historias-container">
            <div className="flex flex-col justify-center items-center w-15 h-15 box-border historia cursor-pointer">
              {historiasFavoritas.length > 0 && (
                <div style={{ minWidth: '120px', height: '200px', marginRight: '8px' }}
                  className="relative flex flex-col justify-center items-center w-15 h-15 box-border historia cursor-pointer"
                >
                  <div style={{ border: '2px solid #464543', backgroundColor: '#ffffff', color: '#464543', marginLeft: '5px' }} className="flex flex-col items-center">
                    {historiasFavoritas.slice(0, 1).map((historia) => (
                      <div key={historia.id} style={{ maxWidth: '120px', height: '200px', position: 'relative', overflow: 'hidden' }}
                        className="flex flex-col justify-between items-center w-15 h-15 p-2 box-border historia cursor-pointer"
                        onClick={() => navigate(`/Vista_Favoritos/${historia.id}`)}
                      >
                        <div className="absolute inset-0 bg-cover bg-center blur-sm"
                          style={{backgroundImage: `url(${historia.imagen || ''})`, filter: 'blur(8px)', zIndex: 1}}>
                        </div>

                        <div className="relative z-10 flex flex-col items-center justify-center h-full">
                          <div className="w-full mt-2 mb-2">
                            <div style={{ maxWidth: '180px' }} className="flex space-x-1">
                              {Array.from({ length: historiasFavoritas.length }).map((_, index) => (
                                <div key={index} className="flex-1 h-1 bg-blue-600 rounded"
                                  style={{ background: '#464543', marginRight: index === historiasFavoritas - 1 ? '0' : '0px' }}
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
                              <ReactPlayer url={historia.video} light={historia.imagen || true}
                                style={{ objectFit: 'cover', maxWidth: '110px', maxHeight: '130px' }}
                                playing={false}
                              />
                              <p className="absolute text-center px-2 py-1 rounded" style={{ color: historia.colortexto, userSelect: 'none' }}>
                                {historia.texto}
                              </p>
                            </div>
                          )}
                          <h2 style={{ color: 'Black', fontSize: '11px' }} className="text-lg font-semibold">Historias Favoritas</h2>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {historiasMasRecientes.map(({ usuario, historia, cantidadHistorias }) => (
              <div key={usuario} style={{ border: '2px solid #464543' }} className="relative flex flex-col items-center mx-2">
                <div style={{ maxWidth: '120px', height: '200px', position: 'relative', overflow: 'hidden' }}
                  className="flex flex-col justify-between items-center w-15 h-15 border border-gray-300 p-2 box-border historia cursor-pointer"
                onClick={() => navigate(`/vista/${historia.id}`)}>
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
                          playing={false}
                        />
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
            onClick={scrollDerecha} style={{ color: '#ffffff',zIndex: 1000, }}
          >
            &gt;
          </button>
        </div>
        {/* md: es para pantallas medianas (tablets) */}
        <div className="amigos-panel p-2 rounded hidden lg:block w-1/4 md:w-1/2 mx-2">
          <button  onClick={irABuscarAmigos} className="btn-buscar-amigos bg-blue-500 p-2 rounded mb-4"
          >
            Buscar amigos
          </button>
          <h2 className="font-bold text-lg mb-2">Tus amigos</h2>
          <ul> {amigos.map((amigo) => (<li key={amigo.id} className="my-2">{amigo.nombre}</li>))}</ul>
        </div>
      </div>
    </div>
  );
};

export default Historias;
