import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faFont, faVideo } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';
import ReactPlayer from 'react-player';
import ReactDOM from 'react-dom';
import { guardarHistoria } from './CrearService'; 

export const Crear = () => {
  const [imagen, setImagen] = useState(null);
  const [video, setVideo] = useState(null);
  const [modo, setModo] = useState('foto');
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [texto, setTexto] = useState('');
  const [tipoLetra, setTipoLetra] = useState('Bitter');
  const [fondo, setFondo] = useState('#0b7dec');
  const [colorTextoT] = useState('#ffffff');
  const [colorTextoI, setColorTextoI] = useState('#000000');
  const [imagenPrevia, setImagenPrevia] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [videoPrevia, setVideoPrevia] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const subirHistoria = async (e) => {
    e.preventDefault();
    const token = Cookies.get('token');
    if (!token) {
      console.error('No se encontró el token');
      return;
    }
    const { id: usuario_id } = JSON.parse(atob(token.split('.')[1]));
    let imagenBase64 = null;

    if (modo === 'foto' && imagen) {
      const img = new Image();
      img.src = URL.createObjectURL(imagen);
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        ctx.font = `30px ${tipoLetra}`;
        ctx.fillStyle = colorTextoI;
        ctx.textAlign = 'center';
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        const lines = texto.split('\n');
        lines.forEach((line, index) => {
          ctx.fillText(line, x, y + index * 40);
        });
        imagenBase64 = canvas.toDataURL();
        const result = await guardarHistoria(usuario_id, imagenBase64, null, texto, tipoLetra, fondo, colorTextoI);
        if (result) {
          setImagen(null);
          setImagenPrevia(null);
          setTexto('');
          setVideo(null);
          setVideoPrevia(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          navigate('/historias');
        }
      };
    } else if (modo === 'texto' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = 340;
      canvas.height = 630;
      ctx.fillStyle = fondo || '#0b7dec';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `30px ${tipoLetra}`;
      ctx.fillStyle = colorTextoT;

      const lineHeight = 50; 
      const maxWidth = canvas.width - 40;
      const lineBreaks = texto.split('\n');
      let totalHeight = 0;

      lineBreaks.forEach((line) => {
        let words = line.split(' ');
        let currentLine = '';
        words.forEach((word) => {
          const testLine = currentLine + word + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;

          if (testWidth > maxWidth && currentLine) {
            totalHeight += lineHeight;
            currentLine = word + ' ';
          } else {
            currentLine = testLine;
          }
        });
        if (currentLine) {
          totalHeight += lineHeight;
        }
      });
      let startY = (canvas.height - totalHeight) / 2 + lineHeight / 2;
      lineBreaks.forEach((line) => {
        let words = line.split(' ');
        let currentLine = '';

        words.forEach((word) => {
          const testLine = currentLine + word + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && currentLine) {
            const x = (canvas.width - ctx.measureText(currentLine.trim()).width) / 2;
            ctx.fillText(currentLine.trim(), x, startY);
            currentLine = word + ' ';
            startY += lineHeight;
          } else {
            currentLine = testLine;
          }
        });
        if (currentLine) {
          const x = (canvas.width - ctx.measureText(currentLine.trim()).width) / 2;
          ctx.fillText(currentLine.trim(), x, startY);
          startY += lineHeight;
        }
      });
      imagenBase64 = canvas.toDataURL();
      const result = await guardarHistoria(usuario_id, imagenBase64);
    if (result) {
      setImagen(null);
      setImagenPrevia(null);
      setTexto('');
      setVideo(null);
      setVideoPrevia(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      navigate('/historias');
    }

    }  else if (modo === 'video' && video) {
      const isValidVideo = ReactPlayer.canPlay(video);
      if (!isValidVideo) {
        console.error('Por favor, introduce una URL válida de una plataforma soportada (YouTube, Vimeo, Drive, etc.)');
        setVideoPrevia(null);
        return;
      }
      const handleDurationCheck = async () => {
        const playerContainer = document.createElement('div');
        playerContainer.style.display = 'none';
        document.body.appendChild(playerContainer);
  
        const player = (
          <ReactPlayer url={video} onDuration={async (duration) => {
            if (duration > 25) {
              console.error('El video no puede durar más de 25 segundos');
              setVideoPrevia(null);
              document.body.removeChild(playerContainer);
            } else {
              setVideoPrevia(video);
              const result = await guardarHistoria(usuario_id, null, video, texto, tipoLetra, fondo, colorTextoI);
              if (result) {
                setImagen(null);
                setImagenPrevia(null);
                setTexto('');
                setVideo(null);
                setVideoPrevia(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
                document.body.removeChild(playerContainer);
                navigate('/historias');
              }
            }
          }} playing={false}/>
        );
        ReactDOM.render(player, playerContainer);
      };
      handleDurationCheck();
    }
  };

  const handleFotoClick = () => {
    fileInputRef.current.click();
  };

  const handleTextoClick = () => {
    setModo('texto');
    setMostrarPopup(true);
  };

  const handleVideoClick = () => {
    setModo('video');
    setMostrarPopup(true);
  };

  const handleClose = () => {
    setTexto('');
    setImagen(null);
    setImagenPrevia(null);
    setFondo('#0b7dec');
    setTipoLetra('Bitter');
    setColorTextoI('#000000')
    setVideo('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setMostrarPopup(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setImagen(selectedFile);
      setModo('foto');
      setMostrarPopup(true);
    } else {
      console.log("No se seleccionó ningún archivo");
    }
  };

  const handleTextoChange = (e) => {
    const inputTexto = e.target.value;
    setTexto(inputTexto);
  };

  const handleFoto_TextoChange = (e) => {
    const inputTexto = e.target.value;
    const lines = inputTexto.split('\n').slice(0, 12);
    let formattedText = lines.map(line => {
      return line.length > 30 ? line.match(/.{1,30}/g).join('\n') : line;
    }).join('\n');
    setTexto(formattedText);
  };

  const generarVistaPreviaFoto = useCallback(() => {
    if (modo === 'foto' && imagen) {
      const img = new Image();
      img.src = URL.createObjectURL(imagen);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        ctx.font = `30px ${tipoLetra}`;
        ctx.fillStyle = colorTextoI;
        ctx.textAlign = 'center';
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        const lines = texto.split('\n');
        lines.forEach((line, index) => {
        ctx.fillText(line, x, y + index * 40);
        });
        setImagenPrevia(canvas.toDataURL());
      };
    }
  }, [imagen, texto, tipoLetra, modo, colorTextoI]);
  
  const generarVistaPreviaTexto = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 200;
    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `20px "${tipoLetra}", sans-serif`;
    ctx.fillStyle = 'black';
    const lineHeight = 30;
    const lines = texto.split('\n');
    
    lines.forEach((line, index) => {
      ctx.fillText(line, 50, 50 + (index * lineHeight));
    });
    setImagenPrevia(canvas.toDataURL());
  }, [fondo, tipoLetra, texto]);
  
  useEffect(() => {
    if (modo === 'foto') {
      generarVistaPreviaFoto();
    }
  }, [imagen, texto, tipoLetra, modo, colorTextoI, generarVistaPreviaFoto]);

  useEffect(() => {
    if (modo === 'texto' && texto) {
      generarVistaPreviaTexto();
    }
  }, [texto, tipoLetra, fondo, modo, generarVistaPreviaTexto]);
  
  return (
    <div className="relative" style={{ backgroundColor: '#e6e7eb', fontFamily: "'Bitter', serif" }}>
      <button style={{background:'#ffffff', color:'#464543'}} className="absolute top-2 left-2 w-10 h-10 rounded-full text-xl font-bold text-center leading-10 transition-colors duration-300" onClick={() => navigate('/historias')}>X</button>
      <div className="flex justify-center items-center h-screen">
        <button onClick={handleFotoClick} style={{ width: '221px', height: '330px' }} 
        className="flex flex-col items-center justify-center bg-[#FFFFFF] text-white p-1 rounded-lg cursor-pointer text-lg m-2 gap-4 transition-colors duration-300 hover:bg-[#5f8ae7]"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-[#464543] rounded-full">
            <FontAwesomeIcon icon={faCamera} size="2x" className="text-white " />
          </div>
          <span className="text-xs font-bold text-black">Crear una historia con foto</span>
        </button>
        <button onClick={handleTextoClick} style={{ width: '221px', height: '330px' }} 
        className="flex flex-col items-center justify-center bg-[#FFFFFF] text-white p-3 rounded-lg cursor-pointer text-lg m-2 gap-4 transition-colors duration-300 hover:bg-[#ae3fbd]"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-[#464543] rounded-full">
            <FontAwesomeIcon icon={faFont} size="2x" className="text-white" />
          </div>
          <span className="text-xs font-bold text-black">Crear una historia de texto</span>
        </button>
        <button onClick={handleVideoClick} style={{ width: '221px', height: '330px' }} 
        className="flex flex-col items-center justify-center bg-[#FFFFFF] text-white p-1 rounded-lg cursor-pointer text-lg m-2 gap-4 transition-colors duration-300 hover:bg-[#3bb273]">
          <div className="flex items-center justify-center w-16 h-16 bg-[#464543] rounded-full">
            <FontAwesomeIcon icon={faVideo} size="2x" className="text-white"/>
          </div>
          <span className="text-xs font-bold text-black">Crear una historia con un video</span>
        </button>
      </div>
      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange}/>

      {mostrarPopup && (
        <div style={{ width: '100%', height: '100%'}} className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 w-11/12 h-3/4 p-5 overflow-hidden flex flex-col">
          <div style={{ width: '100%', height: '100%'}} className="bg-[#e6e7eb] rounded-md w-full p-4 shadow">
          <h3 className="text-lg font-semibold text-Black"> {modo === 'foto' ? 'Crear Historia con Foto' : modo === 'texto' ? 'Crear Historia de Texto': 'Crear Historia con Video' }</h3>
          <form onSubmit={subirHistoria} className="mt-4 bg-[#e6e7eb]">
              {modo === 'foto' && (
                <div className="flex flex-row space-x-4">
                  <div className="flex flex-col w-2/3 space-y-4">
                    {imagen && (
                      <>
                        <div className="flex justify-start">
                          <textarea style={{ width: '300px', height: '300px', overflow: 'auto', whiteSpace: 'pre-wrap',wordWrap: 'break-word',  }} value={texto} onChange={handleFoto_TextoChange}
                          maxLength={200} className="mt-2 p-2 border border-gray-400 rounded resize-none" placeholder="Escribe aquí tu texto" />
                        </div>
                        <div className="flex justify-start">
                          <input type="color" value={colorTextoI} onChange={(e) => setColorTextoI(e.target.value)} className="border border-gray-400 rounded"
                          style={{ width: '300px', height: '50px' }}/>
                        </div>
                        <div className="flex space-x-2">
                          <button style={{ width: '115px', height: '36px' }}onClick={handleClose} className="bg-red-500 text-white rounded px-2 py-1">Descartar</button>
                          <button style={{ width: '175px', height: '36px' }} onClick={handleFileChange} className="bg-[#0866ff] text-white rounded px-2 py-1">Compartir en historia</button>                          
                        </div>
                      </>
                    )}
                  </div>
                  {imagen && (
                    <div className="flex items-center justify-center w-full">
                      <div style={{width: '280px', height: '490px',}}className="flex items-center justify-center border border-gray-400 rounded p-2">
                        <div className="border border-gray-400 rounded overflow-hidden">
                          <img src={imagenPrevia} alt="Vista previa" className=" h-full" style={{ objectFit: 'cover', width: '100%' }}/>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {modo === 'texto' && (
                <div className="flex flex-row space-x-4">
                  <div className="flex flex-col w-2/3 space-y-4">
                    <div className="flex justify-start">
                      <textarea style={{ width: '300px', height: '300px' }} value={texto} onChange={handleTextoChange} maxLength={200}
                        className="mt-2 p-2 border border-gray-400 rounded resize-none" placeholder="Escribe aquí tu texto"
                      />
                    </div>
                    <div className="flex justify-start">
                      <select style={{ width: '300px', height: '50px' }} onChange={(e) => setTipoLetra(e.target.value)} 
                        value={tipoLetra} className="p-2 border border-gray-400 rounded"
                      >
                        <option value="Bitter">Bitter</option>
                        <option value="Arial">Arial</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                      </select>
                    </div>
                    <div className="flex justify-start mb-4">
                      <input style={{ width: '300px', height: '50px' }} type="color" value={fondo}
                        onChange={(e) => setFondo(e.target.value)} className="border border-gray-400 rounded"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button style={{width: '115px', height: '36px'}}  onClick={handleClose} className="bg-red-500 text-white rounded px-2 py-1">Descartar</button>
                      <button style={{width: '175px', height: '36px'}} className="bg-blue-500 text-white rounded px-2 py-1">Compartir en historia</button>                    
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-full">
                    <div style={{ backgroundColor: fondo || '#0b7dec', width: '250px', height: '490px', fontFamily: tipoLetra}}
                      className="flex items-center justify-center border border-gray-400 rounded p-2"
                    >
                      <div className="text-white text-center" 
                      style={{ overflowWrap: 'break-word',  whiteSpace: 'pre-wrap', lineHeight: '1.5', overflowY: 'hidden', maxHeight: '400px', padding: '5px'}}
                      >
                        {texto || "EMPIEZA A ESCRIBIR"}
                      </div>
                    </div>
                  </div>
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
              )}
              {modo === 'video' && (
                <div style={{ marginTop: '24px' }} className="flex flex-row items-start justify-center w-full space-x-8">
                  <div className="flex flex-col w-1/3 space-y-4">
                    <input type="text" placeholder="Ingrese la URL del video" value={video || ''} onChange={(e) => setVideo(e.target.value)} style={{ width: '300px', height: '50px' }}
                    className="border border-gray-300 rounded p-2 w-full"/>
                    <textarea style={{ width: '300px', height: '300px' }} value={texto} onChange={handleTextoChange} maxLength={200}
                    className="p-2 border border-gray-400 rounded resize-none" placeholder="Escribe aquí tu texto"/>
                    <input type="color" value={colorTextoI} onChange={(e) => setColorTextoI(e.target.value)} className="border border-gray-400 rounded"
                    style={{ width: '300px', height: '50px' }}/>
                    <div style={{ width: '300px' }} className="flex space-x-2">
                      <button style={{ width: '115px', height: '36px' }} onClick={handleClose} className="bg-red-500 text-white rounded px-2 py-1">Descartar</button>
                      <button style={{ width: '175px', height: '36px' }} className="bg-blue-500 text-white rounded px-2 py-1">Compartir en historia</button>
                    </div>
                  </div>
                  <div style={{ marginLeft:'120px' }} className="relative flex items-center justify-center w-full h-full">
                    <ReactPlayer url={video}  width= '100%' height="480px" className="border border-gray-400 rounded p-2"/>
                    <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: colorTextoI,
                      fontSize: '24px', textAlign: 'center', width: '100%', }}>
                      {texto}
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Crear;	