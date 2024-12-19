import express from 'express';
import { subirHistoria, getHistorias, marcarComoFavorita, getHistoriasFavoritas,eliminarDeFavoritos} from '../controller/historias';
import { login } from '../controller/login';
import { getAmigos, getUsuariosNoAmigos,aceptarSolicitudAmistad,agregarSolicitudAmistad,rechazarSolicitudAmistad,obtenerSolicitudes} from '../controller/amigos';

const router = express.Router();
//Login
router.post('/login', login);
//Historias
router.get('/historias', getHistorias);
router.get('/historiasf', getHistoriasFavoritas);
router.post('/historias', subirHistoria);
router.put('/historias/favorito/:id', marcarComoFavorita);
router.delete('/historias/favorito/:id', eliminarDeFavoritos);

//Amigos
router.get('/amigos', getAmigos);
router.get('/no-amigos', getUsuariosNoAmigos);
router.get('/solicitudes',obtenerSolicitudes);
router.post('/enviar-solicitud', agregarSolicitudAmistad);
router.post('/aceptar-solicitud', aceptarSolicitudAmistad);
router.post('/rechazar-solicitud', rechazarSolicitudAmistad);

export default router;
