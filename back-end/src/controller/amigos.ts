import { Request, Response } from 'express';
import pool from '../config/conexion';
import jwt from 'jsonwebtoken';
import { ConfigEnv } from '../config/constEnv';
// Obtener lista de amigos del usuario autenticado
export const getAmigos = async (req: Request, res: Response): Promise<Response> => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'No autenticado' });
    const decoded = jwt.verify(token, ConfigEnv.secret_key) as any;
    const usuarioId = decoded.id;

    const response = await pool.query(
      `SELECT u.id, u.nombre 
       FROM tb_amigos a
       JOIN tb_usuario u ON (u.id = a.amigo_id OR u.id = a.usuario_id)
       WHERE (a.usuario_id = $1 OR a.amigo_id = $1) AND u.id != $1`,
      [usuarioId]
    );
    return res.status(200).json(response.rows);
  } catch (error) {
    console.error('Error al obtener amigos: ', error);
    return res.status(500).json('Error al obtener amigos');
  }
};
// Obtener usuarios que no son amigos
export const getUsuariosNoAmigos = async (req: Request, res: Response): Promise<Response> => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'No autenticado' });
    const decoded = jwt.verify(token, ConfigEnv.secret_key) as any;
    const usuarioId = decoded.id;

    const response = await pool.query(
      `SELECT id, nombre 
FROM tb_usuario
WHERE id != $1 
  AND id NOT IN (
    SELECT amigo_id FROM tb_amigos WHERE usuario_id = $1
    UNION
    SELECT usuario_id FROM tb_amigos WHERE amigo_id = $1
    UNION
    SELECT amigo_id FROM tb_solicitudes_amigos WHERE usuario_id = $1 AND estado = 'pendiente'
  )`,
      [usuarioId]
    );

    return res.status(200).json(response.rows);
  } catch (error) {
    console.error('Error al obtener usuarios no amigos:', error);
    return res.status(500).json('Error al obtener usuarios no amigos');
  }
};
// Obtener solicitudes de amistad pendientes
export const obtenerSolicitudes = async (req: Request, res: Response): Promise<Response> => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'No autenticado' });
    const decoded = jwt.verify(token, ConfigEnv.secret_key) as any;
    const usuarioId = decoded.id;

    const response = await pool.query(
      `SELECT sa.id, u.nombre AS nombre_usuario, sa.estado 
       FROM tb_solicitudes_amigos sa
       JOIN tb_usuario u ON u.id = sa.usuario_id
       WHERE sa.amigo_id = $1 AND sa.estado = 'pendiente'`,
      [usuarioId]
    );
    return res.status(200).json(response.rows);
  } catch (error) {
    console.error('Error al obtener solicitudes: ', error);
    return res.status(500).json('Error al obtener solicitudes');
  }
};
// Agregar solicitud de amistad
export const agregarSolicitudAmistad = async (req: Request, res: Response): Promise<Response> => {
  const { usuario_id, amigo_id } = req.body;
  if (!usuario_id || !amigo_id) {
    return res.status(400).json({ message: 'ID del usuario o amigo no proporcionado' });
  }
  try {
    const result = await pool.query(
      `SELECT * FROM tb_solicitudes_amigos 
       WHERE (usuario_id = $1 AND amigo_id = $2 OR usuario_id = $2 AND amigo_id = $1) 
       AND estado = 'pendiente'`,
      [usuario_id, amigo_id]
    );

    if (result.rows.length > 0) {
      return res.status(400).json({ message: 'Ya has enviado una solicitud a este usuario' });
    }
    const response = await pool.query(
      'INSERT INTO tb_solicitudes_amigos (usuario_id, amigo_id) VALUES ($1, $2)',
      [usuario_id, amigo_id]
    );
    return res.status(201).json({ message: 'Solicitud de amistad enviada' });
  } catch (error) {
    console.error('Error al enviar solicitud:', error);
    return res.status(500).json({ message: 'Error al enviar solicitud' });
  }
};
// Aceptar solicitud de amistad
export const aceptarSolicitudAmistad = async (req: Request, res: Response): Promise<Response> => {
  const { solicitud_id } = req.body;
  
  try {
    const response = await pool.query(
      'UPDATE tb_solicitudes_amigos SET estado = $1 WHERE id = $2',
      ['aceptado', solicitud_id]
    );
    const solicitud = await pool.query('SELECT * FROM tb_solicitudes_amigos WHERE id = $1', [solicitud_id]);
    const { usuario_id, amigo_id } = solicitud.rows[0];
    await pool.query(
      'INSERT INTO tb_amigos (usuario_id, amigo_id) VALUES ($1, $2), ($2, $1)',
      [usuario_id, amigo_id]
    );
    return res.status(200).json({ message: 'Solicitud aceptada y ahora son amigos' });
  } catch (error) {
    console.error('Error al aceptar solicitud:', error);
    return res.status(500).json({ message: 'Error al aceptar solicitud' });
  }
};
// Rechazar solicitud de amistad
export const rechazarSolicitudAmistad = async (req: Request, res: Response): Promise<Response> => {
  const { solicitud_id } = req.body;

  try {
    await pool.query('UPDATE tb_solicitudes_amigos SET estado = $1 WHERE id = $2', ['rechazado', solicitud_id]);
    return res.status(200).json({ message: 'Solicitud rechazada' });
  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    return res.status(500).json({ message: 'Error al rechazar solicitud' });
  }
};
