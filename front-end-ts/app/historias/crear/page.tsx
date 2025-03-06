/* eslint-disable react/no-deprecated */
// Se usa la 'disable' por el ReactDOM
"use client";
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faFont, faVideo } from '@fortawesome/free-solid-svg-icons';
import ReactPlayer from 'react-player';
import ReactDOM from 'react-dom';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { guardarHistoria, guardarHistoriaImagen } from '@/app/services/CrearService';

export default function CrearPage() {
    const [mostrarPopup, setMostrarPopup] = useState<boolean>(false);
    const [imagen, setImagen] = useState<File | null>(null);
    const [video, setVideo] = useState<string | undefined>(undefined);
    const [imagenPrevia, setImagenPrevia] = useState<string>('');
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    // Estado unificado para la historia
    const [historiaVar, setHistoriaVar] = useState({
        modo: "foto",
        texto: "",
        tipoLetra: "Bitter",
        fondo: "#0b7dec",
        colorTextoI: "#000000",
    });

    // Limpia las variables utilizadas al editar una historia
    const resetEstados = () => {
        setImagen(null);
        setImagenPrevia('');
        setVideo('');
        setHistoriaVar({ modo: "foto", texto: "", tipoLetra: "Bitter", fondo: "#0b7dec", colorTextoI: "#000000" });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };
    // Cambia el popup para una historia de texto
    const handleTextoClick = () => {
        historiaVar.modo = 'texto';
        setMostrarPopup(true);
    };
    // Cambia el popup para una historia de video
    const handleVideoClick = () => {
        historiaVar.modo = 'video';
        setMostrarPopup(true);
    };
    // Cambia el popup cuando se descarta una historia
    const handleClose = () => {
        resetEstados(); // Limpia las variables
        setMostrarPopup(false);
    };

    // Abre el explorador de archivos del computador
    const handleAbrirExplorador = () => {
        if (fileInputRef.current) {
          fileInputRef.current.click(); 
        }
    };
    // Cambia el popup para una historia de foto
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            historiaVar.modo = 'foto';
            setImagen(selectedFile); // Guarda el archivo en el estado
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagenPrevia(reader.result as string); // Guarda la vista previa
            };
            reader.readAsDataURL(selectedFile);
            setMostrarPopup(true);
        } else {
            console.log("No se seleccionó ningún archivo");
        }
    };

    // Función para manejar cambios en los inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setHistoriaVar((prev) => ({ ...prev, [name]: value })); // Guarda los datos previos con 'prev' y luego el nuevo
    };
    // Genera una vista previa de la historia tipo (foto) usando la foto y canvas
    const generarVistaPreviaFoto = useCallback(() => {
        if (historiaVar.modo === 'foto' && imagen) {
            const img = new Image();
            img.src = URL.createObjectURL(imagen); //Genera un url temporal
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) { return; } // Si no hay contexto, termina la función

                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0);
                ctx.font = `30px ${historiaVar.tipoLetra}`;
                ctx.fillStyle = historiaVar.colorTextoI;
                ctx.textAlign = 'center';
                const x = canvas.width / 2;
                const y = canvas.height / 2;
                const lines = historiaVar.texto.split('\n');

                lines.forEach((line, index) => {
                    ctx.fillText(line, x, y + index * 40); // Escribe cada línea en el canvas
                });

                setImagenPrevia(canvas.toDataURL()); // Al guardar en la variable se cambia visualmente
            };
        }
    }, [imagen, historiaVar.texto, historiaVar.tipoLetra, historiaVar.modo, historiaVar.colorTextoI]);
    // Ejecuta la función 'generar..' cuando (modo === foto)
    useEffect(() => {
        if (historiaVar.modo === 'foto') {
            generarVistaPreviaFoto();
        }
    }, [imagen, historiaVar.texto, historiaVar.tipoLetra, historiaVar.modo, historiaVar.colorTextoI, generarVistaPreviaFoto]); // Dependencias
    // Crea un contenedor oculto para obtener la duracion del video
    const obtenerDuracionVideo = async (videoUrl: string): Promise<number> => {
        const playerContainer = document.createElement('div'); // Contenedor temporal
        playerContainer.style.display = 'none'; // Oculta el contenedor
        document.body.appendChild(playerContainer);
        //Define la promesa para manejar y obtener la duración del video
        const promesaDuracion = new Promise<number>((resolve, reject) => {
            ReactDOM.render(
                <ReactPlayer
                    url={videoUrl} // Url del video a verificar
                    onDuration={(duration: number) => {
                        resolve(duration); //Resuelve la promsesa obteninedo la duración del video
                    }}

                    onError={(error) => {
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
    // Crear la imagen con el input de texto encima
    const procesarImagen = async (imagen: File, texto: string, tipoLetra: string, colorTextoI: string) => {
        const img = new Image();
        img.src = URL.createObjectURL(imagen);
        const promesaArchivo = new Promise<File> ((resolve, reject) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject("No se pudo obtener el contexto del canvas");
                    return;
                }
    
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
    
                // Configuración del texto
                ctx.font = `30px ${tipoLetra}`;
                ctx.fillStyle = colorTextoI;
                ctx.textAlign = 'center';
    
                // Posiciona el texto en el centro
                const x = canvas.width / 2;
                const y = canvas.height / 2;
                texto.split("\n").forEach((line, index) => {
                    ctx.fillText(line, x, y + index * 40);
                });
    
                // Convertir a Blob y crear un archivo
                canvas.toBlob((blob) => {
                    if (blob) {
                        const archivoFinal = new File([blob], imagen.name+"_editada.png", { type: "image/png" });
                        resolve(archivoFinal);
                    } else {
                        reject("Error al generar la imagen final");
                    }
                }, "image/png");
            };

            img.onerror = (error) => reject(error);
        });

        try {
            const archivo = await promesaArchivo;
            return archivo;
        } catch (error) {
            throw error;
        }
    };
    // Enviar historia
    const subirHistoria = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Previene la acción predeterminada del formulario

        const usuario_id = 4; // Usuario quemado (Juan Pérez)
        let imagenBase64: string | null = null; // Inicializa la variable para imágenes

        // Procesa historias en modo "foto"
        if (historiaVar.modo === 'foto' && imagen) {
            const imagenProcesada = await procesarImagen(imagen, historiaVar.texto, historiaVar.tipoLetra, historiaVar.colorTextoI);
            const formData = new FormData();
            formData.append("usuario_id", usuario_id.toString());
            formData.append("modo", "foto");
            formData.append("imagen", imagenProcesada);
            formData.append("tipoLetra", historiaVar.tipoLetra);
            formData.append("fondo", historiaVar.fondo);
            formData.append("texto", historiaVar.texto);
            formData.append("colorTexto", historiaVar.colorTextoI);

            const result = await guardarHistoriaImagen(formData);
            if (result) {
                resetEstados();
                router.push("/historias");
            }
        }

        // Procesa historias en modo "texto"
        else if (historiaVar.modo === 'texto' && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            canvas.width = 340;
            canvas.height = 630;
            ctx.fillStyle = historiaVar.fondo;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = `30px ${historiaVar.tipoLetra}`;
            ctx.fillStyle = "#ffffff";

            const lines = historiaVar.texto.split("\n");
            lines.forEach((line, index) => ctx.fillText(line, canvas.width / 2, (canvas.height / 2) + index * 50));

            imagenBase64 = canvas.toDataURL();
            const result = await guardarHistoria(historiaVar.modo, usuario_id, imagenBase64, historiaVar.tipoLetra, historiaVar.fondo, "", historiaVar.texto, historiaVar.colorTextoI);
            if (result) {
                resetEstados();
                router.push("/historias");
            }
        }

        // Procesa historias en modo "video"
        else if (historiaVar.modo === 'video' && video) {
            const isValidVideo = ReactPlayer.canPlay(video);
            if (!isValidVideo) {
                console.error('Por favor, introduce una URL válida de una plataforma soportada (YouTube, Vimeo, Drive, etc.)');
                return;
            }

            const handleDurationCheck = async () => {
                const duration = await obtenerDuracionVideo(video); // Valida la duración
                if (duration > 25) {
                    console.error('El video no puede durar más de 25 segundos');
                    return;
                }

                const result = await guardarHistoria(historiaVar.modo, usuario_id, "", historiaVar.tipoLetra, historiaVar.fondo, video, historiaVar.texto, historiaVar.colorTextoI);
                if (result) {
                    resetEstados();
                    router.push("/historias");
                }
            };


            handleDurationCheck(); // Llama a la validación de duración
        }
    };

    return (
        <div className="relative" style={{ backgroundColor: '#e6e7eb', fontFamily: "'Bitter', serif" }}>
            <button
                style={{ background: '#ffffff', color: '#464543' }}
                className="absolute top-2 left-2 w-10 h-10 rounded-full text-xl font-bold text-center">
                <Link href='/historias'>
                    X
                </Link>
            </button>
            <div className="flex justify-center items-center h-screen">
                <button
                    type='button'
                    onClick={handleAbrirExplorador}
                    style={{ width: '221px', height: '330px' }}
                    className="flex flex-col items-center justify-center bg-[#FFFFFF] text-white p-1 rounded-lg cursor-pointer text-lg m-2 gap-4 transition-colors duration-300 hover:bg-[#5f8ae7]">
                    <div className="flex items-center justify-center w-16 h-16 bg-[#464543] rounded-full">
                        <FontAwesomeIcon icon={faCamera} size="2x" className="text-white" />
                    </div>
                    <span className="text-xs font-bold text-black">Crear una historia con foto</span>
                </button>
                {/* Input oculto para seleccionar imagen */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                />

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
                        <FontAwesomeIcon icon={faVideo} size="2x" className="text-white" />
                    </div>
                    <span className="text-xs font-bold text-black">Crear una historia con un video</span>
                </button>
            </div>


            {mostrarPopup && (
                // El "div" actua como overlay/fondo oscuro mejorando el diseño 
                <div className="fixed top-[97px] left-[256px] right-0 bottom-0 flex items-center justify-center bg-black/50">
                    <div className="w-[calc(100%-2rem)] h-[calc(100%-2rem)] max-w-6xl max-h-[800px] bg-white rounded-lg shadow-lg z-50 p-5">
                        <div className="w-full h-full bg-[#e6e7eb] rounded-md p-4 shadow">
                            <h3 className="text-lg font-semibold text-Black"> {historiaVar.modo === 'foto' ? 'Crear Historia con Foto' : historiaVar.modo === 'texto' ? 'Crear Historia de Texto' : 'Crear Historia con Video'}</h3>
                            <form onSubmit={subirHistoria} className="mt-4 bg-[#e6e7eb]">
                                {/*Historia con Foto*/}
                                {historiaVar.modo === 'foto' && (
                                    <div className="flex flex-row space-x-4">
                                        <div className="flex flex-col w-2/3 space-y-4">
                                            {imagen && (
                                                <>
                                                    {/* INPUT TEXTO */}
                                                    <div className="flex justify-start">
                                                        <textarea name="texto" value={historiaVar.texto} onChange={handleChange} style={{ width: '300px', height: '300px', overflow: 'auto', whiteSpace: 'pre-wrap', wordWrap: 'break-word', }}
                                                            maxLength={200} className="mt-2 p-2 border border-gray-400 rounded resize-none" placeholder="Escribe aquí tu texto" />
                                                    </div>
                                                    {/* INPUT SELECCIONAR COLOR DE LETRA */}
                                                    <div className="flex justify-start">
                                                        <input type="color" name="colorTextoI" value={historiaVar.colorTextoI} onChange={handleChange} className="border border-gray-400 rounded"
                                                            style={{ width: '300px', height: '50px' }} />
                                                    </div>
                                                    {/* Botones para Compartir o Descartar historia */}
                                                    <div className="flex space-x-2">
                                                        <button style={{ width: '115px', height: '36px' }} onClick={handleClose} className="bg-red-500 text-white rounded px-2 py-1">
                                                            Descartar
                                                        </button>
                                                        <button type="submit" style={{ width: '175px', height: '36px' }} className="bg-blue-500 rounded px-2 py-1">
                                                            Compartir en historia
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        {/* Pre visualización de la historia */}
                                        {imagen && (
                                            <div className="flex items-center justify-center w-full">
                                                <div style={{ width: '280px', height: '490px', }} className="flex items-center justify-center border border-gray-400 rounded p-2">
                                                    <div className="border border-gray-400 rounded overflow-hidden">
                                                        <img src={imagenPrevia} alt="Vista previa" className=" h-full" style={{ objectFit: 'cover', width: '100%' }} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {/*Historia con Texto*/}
                                {historiaVar.modo === 'texto' && (
                                    <div className="flex flex-row space-x-4">
                                        <div className="flex flex-col w-2/3 space-y-4">
                                            <div className="flex justify-start">
                                                {/* INPUT TEXTO */}
                                                <textarea name="texto" value={historiaVar.texto} onChange={handleChange} style={{ width: '300px', height: '300px' }} maxLength={200}
                                                    className="mt-2 p-2 border border-gray-400 rounded resize-none" placeholder="Escribe aquí tu texto" />
                                            </div>
                                            {/* INPUT SELECIONAR EL TIPO DE LETRA */}
                                            <div className="flex justify-start">
                                                <select name="tipoLetra" value={historiaVar.tipoLetra} onChange={handleChange} style={{ width: '300px', height: '50px' }}
                                                    className="p-2 border border-gray-400 rounded">
                                                    <option value="Bitter">Bitter</option>
                                                    <option value="Arial">Arial</option>
                                                    <option value="Courier New">Courier New</option>
                                                    <option value="Georgia">Georgia</option>
                                                </select>
                                            </div>
                                            {/* INPUT SELECCIONAR COLOR DE FONDO */}
                                            <div className="flex justify-start mb-4">
                                                <input type="color" name="fondo" value={historiaVar.fondo} onChange={handleChange} style={{ width: '300px', height: '50px' }}
                                                    className="border border-gray-400 rounded" />
                                            </div>
                                            {/* Botones para Compartir o Descartar historia */}
                                            <div className="flex space-x-2">
                                                <button type="button" onClick={handleClose} style={{ width: '115px', height: '36px' }} className="bg-red-500 text-white rounded px-2 py-1">
                                                    Descartar
                                                </button>
                                                <button type="submit" style={{ width: '175px', height: '36px' }} className="bg-blue-500 rounded px-2 py-1">
                                                    Compartir en historia
                                                </button>
                                            </div>
                                        </div>
                                        {/* Pre visualización de la historia */}
                                        <div className="flex items-center justify-center w-full">
                                            <div style={{ backgroundColor: historiaVar.fondo || '#0b7dec', width: '250px', height: '490px', fontFamily: historiaVar.tipoLetra }}
                                                className="flex items-center justify-center border border-gray-400 rounded p-2">
                                                <div className="text-white text-center"
                                                    style={{ overflowWrap: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.5', overflowY: 'hidden', maxHeight: '400px', padding: '5px' }}>
                                                    {historiaVar.texto || "EMPIEZA A ESCRIBIR"}
                                                </div>
                                            </div>
                                        </div>
                                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                                    </div>
                                )}
                                {/*Historia con Video*/}
                                {historiaVar.modo === 'video' && (
                                    <div style={{ marginTop: '24px' }} className="flex flex-row items-start justify-center w-full space-x-8">
                                        <div className="flex flex-col w-1/3 space-y-4">
                                            {/* INPUT DEL LINK DE VIDEO */}
                                            <input type="text" placeholder="Ingrese la URL del video" value={video || ''} onChange={(e) => setVideo(e.target.value)} style={{ width: '300px', height: '50px' }}
                                                className="border border-gray-300 rounded p-2 w-full" />
                                            {/* INPUT TEXTO */}
                                            <textarea name="texto" value={historiaVar.texto} onChange={handleChange} style={{ width: '300px', height: '300px' }}  maxLength={200}
                                                className="p-2 border border-gray-400 rounded resize-none" placeholder="Escribe aquí tu texto" />
                                            {/* INPUT SELECCIONAR COLOR DE FONDO */}
                                            <input type="color" name="colorTextoI" value={historiaVar.colorTextoI} onChange={handleChange} className="border border-gray-400 rounded"
                                                style={{ width: '300px', height: '50px' }} />
                                            {/* Botones para Compartir o Descartar historia */}
                                            <div style={{ width: '300px' }} className="flex space-x-2">
                                                <button style={{ width: '115px', height: '36px' }} onClick={handleClose} className="bg-red-500 text-white rounded px-2 py-1">
                                                    Descartar
                                                </button>
                                                <button type="submit" style={{ width: '175px', height: '36px' }} className="bg-blue-500 rounded px-2 py-1">
                                                    Compartir en historia
                                                </button>
                                            </div>
                                        </div>
                                        {/* Pre visualización de la historia */}
                                        <div style={{ marginLeft: '120px' }} className="relative flex items-center justify-center w-full h-full">
                                            <ReactPlayer url={video} width='100%' height="480px" className="border border-gray-400 rounded p-2" />
                                            <div style={{
                                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: historiaVar.colorTextoI,
                                                fontSize: '24px', textAlign: 'center', width: '100%',
                                            }}>
                                                {historiaVar.texto}
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </form>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}