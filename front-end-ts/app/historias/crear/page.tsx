/* eslint-disable react/no-deprecated */
// Se usa la 'disable' por el ReactDOM
"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faFont, faVideo } from '@fortawesome/free-solid-svg-icons';
import ReactPlayer from 'react-player';
import ReactDOM from 'react-dom';
import { guardarHistoria } from '@/app/services/CrearService';
import Link from 'next/link';

export default function CrearPage(){
  const [imagen, setImagen] = useState<File | null>(null);
  const [video, setVideo] = useState<string | undefined>(undefined);
  const [modo, setModo] = useState<'foto' | 'texto' | 'video'>('foto');
  const [mostrarPopup, setMostrarPopup] = useState<boolean>(false);
  const [texto, setTexto] = useState<string>('');
  const [tipoLetra, setTipoLetra] = useState<string>('Bitter');
  const [fondo, setFondo] = useState('#0b7dec');
  const [colorTextoT] = useState('#ffffff');
  const [colorTextoI, setColorTextoI] = useState<string>('#000000');
  const [imagenPrevia, setImagenPrevia] = useState<string>('');
  const [videoPrevia, setVideoPrevia] = useState(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  //Debido al tipo de argumento 'MouseEvent', se separo de 'handleFileChange'
  // const handleFotoClick = (e: React.MouseEvent<HTMLInputElement>) => {
  //   fileInputRef.current?.click();//activa el input de archivo si existe
  // };
  
  // Limpia las variables utilizadas al editar una historia
  const resetEstados = () => {
    setImagen(null); //
    setImagenPrevia(''); //
    setTexto(''); //
    setVideo(''); //
    setFondo('#0b7dec');
    setTipoLetra('Bitter');
    setColorTextoI('#000000')
    setVideoPrevia(null); // DA IGUAL
    if (fileInputRef.current) { //
      fileInputRef.current.value = '';
    }
  };
  // Cambia el popup para una historia de texto
  const handleTextoClick = () => {
    setModo('texto');
    setMostrarPopup(true);
  };
  // Cambia el popup para una historia de video
  const handleVideoClick = () => {
    setModo('video');
    setMostrarPopup(true);
  };
  // Cambia el popup cuando se descarta una historia
  const handleClose = () => {
    resetEstados(); // Limpia las variables
    setMostrarPopup(false);
  };
  // Cambia el popup para una historia de foto
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setImagen(selectedFile);
      setModo('foto');
      setMostrarPopup(true);
    } else {
      console.log("No se seleccionó ningún archivo");
    }
  };
  // Guarda el input de Texto al edidar una historia de tipo (texto y video)
  const handleTextoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputTexto = e.target.value;
    setTexto(inputTexto);
  };
  // Guarda el input de Texto al edidar una historia de tipo (foto)
  const handleFoto_TextoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const lines = e.target.value.split('\n').slice(0, 12);
    const formattedText = lines.map(line => 
      line.length > 30 ? line.match(/.{1,30}/g)?.join('\n') || '' : line
    ).join('\n');
    setTexto(formattedText);
  };
  // Genera una vista previa de la historia tipo (foto) usando la foto y canvas
  const generarVistaPreviaFoto = useCallback(() => {
    if (modo === 'foto' && imagen) {
      const img = new Image();
      img.src = URL.createObjectURL(imagen); //Genera un url temporal
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { return; } // Si no hay contexto, termina la función
        
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
        ctx.fillText(line, x, y + index * 40); // Escribe cada línea en el canvas
        });
         
        setImagenPrevia(canvas.toDataURL()); // Al guardar en la variable se cambia visualmente
      };
    }
  }, [imagen, texto, tipoLetra, modo, colorTextoI]);
  
  // CREO QUE NO SE ESTA USANDO ESTA FUNCIÓN EN EL 'RETURN'
  // Genera una vista previa de la historia tipo (texto) usando canvas
  const generarVistaPreviaTexto = useCallback(() => {
    const canvas = canvasRef.current;
    if(!canvas) { return; } //Si no existe, termina la función

    const ctx = canvas.getContext('2d');
    if (!ctx) { return; } //Si no hay contexto, termina la función

    canvas.width = 300;
    canvas.height = 200;

    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Dibuja el fondo en el canva
    
    ctx.font = `20px "${tipoLetra}", sans-serif`;
    ctx.fillStyle = 'black';
    
    const lineHeight = 30;
    const lines = texto.split('\n');

    lines.forEach((line, index) => {
      ctx.fillText(line, 50, 50 + (index * lineHeight)); // Dibuja cada línea en el canvas
    });

    setImagenPrevia(canvas.toDataURL());
  }, [fondo, tipoLetra, texto]);

  // Ejecuta la función 'generar..' cuando (modo === foto)
  useEffect(() => {
    if (modo === 'foto') {
      generarVistaPreviaFoto();
    }
  }, [imagen, texto, tipoLetra, modo, colorTextoI, generarVistaPreviaFoto]); // Dependencias
  // Ejecuta la función 'generar..' cuando (modo === texto)
  useEffect(() => {
    if (modo === 'texto' && texto) {
      generarVistaPreviaTexto();
    }
  }, [texto, tipoLetra, fondo, modo, generarVistaPreviaTexto]);
  // Crea un contenedor oculto para obtener la duracion del video
  const obtenerDuracionVideo = async (videoUrl: string): Promise<number> => {
    const playerContainer = document.createElement('div'); // Contenedor temporal
    playerContainer.style.display = 'none'; // Oculta el contenedor
    document.body.appendChild(playerContainer);
    //Define la promesa para manejar y obtener la duración del video
    const promesaDuracion = new Promise<number>((resolve, reject) =>{
      ReactDOM.render(
        <ReactPlayer
          url = {videoUrl} // Url del video a verificar
          onDuration={(duration: number) => {
            resolve(duration); //Resuelve la promsesa obteninedo la duración del video
          }}
          
          onError = {(error) => {
            reject(error);
          }}
          playing={false} //No reproduce automáticamente 
        />,
        playerContainer
      );
    });

    try {
      const duracion = await promesaDuracion; 
      document.body.removeChild(playerContainer);
      return duracion;
    } catch (error) {
      document.body.removeChild(playerContainer);
      throw error;
    }
  };
  // Se ejecuta al llenarse el formulario
  const subirHistoria = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault(); // Previene la acción predeterminada del formulario
  
    // Obtiene el token de cookies
    // const token = Cookies.get('token');
    // if (!token) {
    //   console.error('No se encontró el token');
    //   return;
    // }
    
    // Decodifica el token y obtiene el ID del usuario
    // const { id: usuario_id } = JSON.parse(atob(token.split('.')[1])) as { id: number };
    const usuario_id = 4; // Usuario quemado (Juan Pérez)
    let imagenBase64: string | null = null; // Inicializa la variable para imágenes
  
    // Procesa historias en modo "foto"
    if (modo === 'foto' && imagen) {
      const img = new Image();
      img.src = URL.createObjectURL(imagen);
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
  
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        ctx.font = `30px ${tipoLetra}`;
        ctx.fillStyle = colorTextoI;
        ctx.textAlign = 'center';
  
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        texto.split('\n').forEach((line, index) => {
          ctx.fillText(line, x, y + index * 40);
        });
  
        imagenBase64 = canvas.toDataURL(); // Convierte la imagen a base64
        // const result = await guardarHistoria(usuario_id, imagenBase64, null, texto, tipoLetra, fondo, colorTextoI);
        // if (result) {
        //   resetEstados(); // Limpia los estados
        //   // Obtiene el componenete Link para simular el click y redigir
        //   const redirigir = document.getElementById('redirect-link') as HTMLAnchorElement;
        //   if (redirigir){
        //     redirigir.click();
        //   }
        // }
      };
    }
  
    // Procesa historias en modo "texto"
    else if (modo === 'texto' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
  
      canvas.width = 340;
      canvas.height = 630;
      ctx.fillStyle = fondo;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `30px ${tipoLetra}`;
      ctx.fillStyle = colorTextoT;
  
      const lineHeight = 50;
      const lines = texto.split('\n');
      lines.forEach((line, index) => {
        const x = canvas.width / 2;
        const y = (canvas.height / 2) + index * lineHeight;
        ctx.fillText(line, x, y);
      });
  
      imagenBase64 = canvas.toDataURL();

      // const varSave = [usuario_id, imagenBase64, tipoLetra, fondo, null, texto, colorTextoT];
      // console.log("Arreglo: ",varSave);
      // 'null' porque guarda la variable de video
      // ENVIAR EL 'modo' para que en el endpoint se pueda manejar que tipo de historia va a guardar
      const result = await guardarHistoria(modo, usuario_id, imagenBase64, tipoLetra, fondo, '', texto, colorTextoI);

      // if (varSave) {
      if (result) {
        resetEstados(); // Limpia los estados
        // RESOLVER PORQUE NO REDIRIGUE A /historias
        // const redirigir = document.getElementById('redirect-link') as HTMLAnchorElement;
        // if (redirigir){
        //   redirigir.click();
        // }
      }  
    }
  
    // Procesa historias en modo "video"
    else if (modo === 'video' && video) {
      const isValidVideo = ReactPlayer.canPlay(video);
      if (!isValidVideo) {
        console.error('Por favor, introduce una URL válida de una plataforma soportada (YouTube, Vimeo, Drive, etc.)');
        setVideoPrevia(null);
        return;
      }
  
      const handleDurationCheck = async () => {
        const duration = await obtenerDuracionVideo(video); // Valida la duración
        if (duration > 25) {
          console.error('El video no puede durar más de 25 segundos');
          setVideoPrevia(null);
          return;
        }
  
        // const result = await guardarHistoria(usuario_id, null, video, texto, tipoLetra, fondo, colorTextoI);
        // if (result) {
        //   resetEstados(); // Limpia los estados
        //   // Obtiene el componenete Link para simular el click y redigir
        //   const redirigir = document.getElementById('redirect-link') as HTMLAnchorElement;
        //   if (redirigir){
        //     redirigir.click();
        //   }
        // }  
      };
  
      handleDurationCheck(); // Llama a la validación de duración
    }
  };


  return(
    <div className="relative" style={{ backgroundColor: '#e6e7eb', fontFamily: "'Bitter', serif" }}>
      <button 
        style={{background:'#ffffff', color:'#464543'}} 
        className="absolute top-2 left-2 w-10 h-10 rounded-full text-xl font-bold text-center">
        <Link href='/historias'>
          X
        </Link>
      </button>
      <div className="flex justify-center items-center h-screen">
        <button 
          onClick={handleFileChange}
          style={{ width: '221px', height: '330px' }} 
          className="flex flex-col items-center justify-center bg-[#FFFFFF] text-white p-1 rounded-lg cursor-pointer text-lg m-2 gap-4 transition-colors duration-300 hover:bg-[#5f8ae7]">
          <div className="flex items-center justify-center w-16 h-16 bg-[#464543] rounded-full">
            <FontAwesomeIcon icon={faCamera} size="2x" className="text-white" />
          </div>
          <span className="text-xs font-bold text-black">Crear una historia con foto</span>
        </button>
        <button 
          onClick={handleTextoClick} 
          style={{ width: '221px', height: '330px' }} 
          className="flex flex-col items-center justify-center bg-[#FFFFFF] text-white p-3 rounded-lg cursor-pointer text-lg m-2 gap-4 transition-colors duration-300 hover:bg-[#ae3fbd]">
          <div className="flex items-center justify-center w-16 h-16 bg-[#464543] rounded-full">
            <FontAwesomeIcon icon={faFont} size="2x" className="text-white" />
          </div>
          <span className="text-xs font-bold text-black">Crear una historia de texto</span>
        </button>
        <button 
          onClick={handleVideoClick} 
          style={{ width: '221px', height: '330px' }} 
          className="flex flex-col items-center justify-center bg-[#FFFFFF] text-white p-1 rounded-lg cursor-pointer text-lg m-2 gap-4 transition-colors duration-300 hover:bg-[#3bb273]">
          <div className="flex items-center justify-center w-16 h-16 bg-[#464543] rounded-full">
            <FontAwesomeIcon icon={faVideo} size="2x" className="text-white"/>
          </div>
          <span className="text-xs font-bold text-black">Crear una historia con un video</span>
        </button>
      </div>

      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange}/>

      {mostrarPopup && (
        // El "div" actua como overlay/fondo oscuro mejorando el diseño 
        <div className="fixed top-[97px] left-[256px] right-0 bottom-0 flex items-center justify-center bg-black/50">
          <div className="w-[calc(100%-2rem)] h-[calc(100%-2rem)] max-w-6xl max-h-[800px] bg-white rounded-lg shadow-lg z-50 p-5">
            <div className="w-full h-full bg-[#e6e7eb] rounded-md p-4 shadow">
              <h3 className="text-lg font-semibold text-Black"> {modo === 'foto' ? 'Crear Historia con Foto' : modo === 'texto' ? 'Crear Historia de Texto': 'Crear Historia con Video' }</h3>
              <form onSubmit={subirHistoria} className="mt-4 bg-[#e6e7eb]">
                {/*Historia con Foto*/}
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
                              <button style={{ width: '115px', height: '36px' }} onClick={handleClose} className="bg-red-500 text-white rounded px-2 py-1">Descartar</button>
                              <button style={{ width: '175px', height: '36px' }} className="bg-[#0866ff] rounded px-2 py-1">
                                <Link href="/historias"  id="redirect-link"> Compartir en historia </Link>
                              </button>                          
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
                {/*Historia con Texto*/}
                {modo === 'texto' && (
                  <div className="flex flex-row space-x-4">
                    <div className="flex flex-col w-2/3 space-y-4">
                      <div className="flex justify-start">
                        {/* INPUT TEXTO */}
                        <textarea style={{ width: '300px', height: '300px' }} value={texto} onChange={handleTextoChange} maxLength={200}
                        className="mt-2 p-2 border border-gray-400 rounded resize-none" placeholder="Escribe aquí tu texto"/>
                      </div>
                      {/* INPUT SELECIONAR EL TIPO DE LETRA */}
                      <div className="flex justify-start">
                        <select style={{ width: '300px', height: '50px' }} onChange={(e) => setTipoLetra(e.target.value)} 
                          value={tipoLetra} className="p-2 border border-gray-400 rounded">
                            <option value="Bitter">Bitter</option>
                            <option value="Arial">Arial</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Georgia">Georgia</option>
                        </select>
                      </div>
                      {/* INPUT SELECCIONAR COLOR DE FONDO */}
                      <div className="flex justify-start mb-4">
                        <input style={{ width: '300px', height: '50px' }} type="color" value={fondo}
                        onChange={(e) => setFondo(e.target.value)} className="border border-gray-400 rounded"/>
                      </div>
                      {/* Botones para Compartir o Descartar historia */}
                      <div className="flex space-x-2">
                        <button style={{width: '115px', height: '36px'}} onClick={handleClose} className="bg-red-500 text-white rounded px-2 py-1">Descartar</button>
                        <Link type="submit" href="/historias" style={{width: '175px', height: '36px'}} className="bg-blue-500 rounded px-2 py-1">
                          Compartir en historia
                        </Link>                    
                          {/* <Link href="/historias" > Compartir en historia </Link> */}
                      </div>
                    </div>
                    {/* Pre visualización de la historia */}
                    <div className="flex items-center justify-center w-full">
                      <div style={{ backgroundColor: fondo || '#0b7dec', width: '250px', height: '490px', fontFamily: tipoLetra}}
                      className="flex items-center justify-center border border-gray-400 rounded p-2">
                        <div className="text-white text-center" 
                        style={{ overflowWrap: 'break-word',  whiteSpace: 'pre-wrap', lineHeight: '1.5', overflowY: 'hidden', maxHeight: '400px', padding: '5px'}}>
                            {texto || "EMPIEZA A ESCRIBIR"}
                        </div>
                      </div>
                    </div>
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                  </div>
                )}
                {/*Historia con Video*/}
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
                          <button style={{ width: '175px', height: '36px' }} className="bg-blue-500 rounded px-2 py-1">
                            <Link href="/historias"  id="redirect-link"> Compartir en historia </Link>
                          </button>
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

                {/* Componenete hidden/invisible ayudara a redirigir despues de completar el form */}
                {/* <Link href="/historias" className="hidden absolute bottom-0 left-0" id="redirect-link"> Redirigir </Link> */}
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}