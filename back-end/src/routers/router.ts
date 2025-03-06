import express from 'express';
import { leerHistorias, crearHistoria, eliminarHistoria, crearHistoriaFavorita, leerHistoriasFavoritas, eliminarHistoriaFavorita, crearHistoriaImagen } from '../controller/historias.controller';
import { login } from '../controller/login.controller.';
import { upload } from "../config/multerConfig";

const router = express.Router();

//Login
// ACCIÓN: Inicia sesión y si es correcto se crea un token con jwt
// MÉTODO: POST
// URL:    http://localhost:3306/api/login
// PETICIÓN JSON: 
// {
//   "email": "juan.perez@example.com",
//   "password": "password123"
// }
router.post('/login', login);

//Historias
// ACCIÓN: Obtiene historias del usuario y sus amigos
// MÉTODO: GET
// URL:    http://localhost:3306/api/historias?usuario_id=${usuario_id}
// PARAMETROS: 
// usuario_id = usuario ID especifico que realiza la consulta 
router.get('/historias', leerHistorias);

// ACCIÓN: Subir nueva historia
// MÉTODO: POST
// URL:    http://localhost:3306/api/historias/crear
// PETICIÓN JSON: 
// {
//   "usuario_id": 4,
//   "imagen": "https://i.pinimg.com/564x/82/30/26/8230266857925dedc150f7ab1444b914.jpg",
//   "tipoLetra": "Arial",
//   "fondo": "#FFFFFF",
//   "video": null,
//   "texto": "Esta es una historia de prueba 5",
//   "colortexto": "#000000"
// }
router.post('/historias/crear', crearHistoria);

// ACCIÓN: Subir nueva historia de tipo 'foto'
// MÉTODO: POST
// URL:    http://localhost:3306/api/historias/crearImg
// PETICIÓN FORM: Llenar en la petición de tipo 'Form'  
// 1.
// usuario_id=4&modo=foto&tipoLetra=Bitter&fondo=#0b7dec&texto=&colorTexto=&~imagen=1741227851848.png
// 2.
// usuario_id=4
// modo=foto
// tipoLetra=Bitter
// fondo=#0b7dec
// texto=*puede ser null*
// colorTexto=*puede ser null*
// imagen=1741227851848.png

router.post('/historias/crearImg', upload.single("imagen"), crearHistoriaImagen);

// ACCIÓN: Elimina una historia por su id especifico
// MÉTODO: DELETE
// URL:    http://localhost:3306/api/historias/numero(id)_de_la_historia
// PARÁMETRO (numero(id)_de_la_historia): ID de la Historia que se desea eliminar
// PETICIÓN JSON:
// { }
router.delete("/historias/:id", eliminarHistoria);

//Historias Favoritas
// ACCIÓN: Obtiene historias favoritas del usuario
// MÉTODO: POST
// URL:    http://localhost:3306/api/historias/favoritas
// PETICIÓN JSON:
// {
//   "usuario_id": 2
// }
router.get('/historias/favoritas', leerHistoriasFavoritas);

// ACCIÓN: Crea un nuevo registro Historia Favorita
// MÉTODO: POST
// URL:    http://localhost:3306/api/historias/favoritas/marcar
// PETICIÓN JSON:
// {
//   "historia_id": 13,
//   "usuario_id": 4
// }
router.post('/historias/favoritas/marcar', crearHistoriaFavorita);

// ACCIÓN: Elimina una historia favorita por su id especifico
// MÉTODO: DELETE
// URL:    http://localhost:3306/api/historias/favoritas/:numero(id)_de_la_historiaFavorita
// PARÁMETRO (numero(id)_de_la_historiaFavorita): ID de la HistoriaFavorita que se desea eliminar
// PETICIÓN JSON:
// { }
router.delete('/historias/favoritas/:id', eliminarHistoriaFavorita);

export default router;
