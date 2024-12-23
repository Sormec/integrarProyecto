import { Request, Response } from 'express';
import pool from '../config/conexion';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { ConfigEnv } from '../config/constEnv';
// Obtener historias
export const getHistorias = async (req: Request, res: Response): Promise<Response> => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const decoded = jwt.verify(token, ConfigEnv.secret_key) as any;
    const usuarioId = decoded.id;
    const response = await pool.query(`SELECT h.id, h.imagen, h.video, h.texto, h.colortexto, h.fecha_publicacion,
      h.favorito, h.estado, u.nombre AS usuario_nombre, 
      COUNT(h.id) OVER (PARTITION BY h.usuario_id) AS total_historias
      FROM tb_historias h 
      JOIN tb_usuario u ON h.usuario_id = u.id 
      LEFT JOIN tb_amigos a 
        ON (a.usuario_id = $1 AND a.amigo_id = h.usuario_id) 
        OR (a.amigo_id = $1 AND a.usuario_id = h.usuario_id) 
      WHERE (h.usuario_id = $1 OR a.usuario_id IS NOT NULL) 
        AND h.estado = $2
      ORDER BY h.fecha_publicacion DESC;`,
      [usuarioId, 'activo']
    );

    const historias = response.rows.filter(historia => historia.video || historia.imagen);
    return res.status(200).json(historias);
  } catch (error) {
    console.error('Error al obtener las historias: ', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
// Subir nueva historia
export const subirHistoria = async (req: Request, res: Response): Promise<Response> => {
  const { usuario_id, imagen, tipoLetra, fondo, video, texto, colortexto } = req.body;

  try {
    if (!usuario_id || (!imagen && !video && !texto)) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    const usuario = await pool.query('SELECT * FROM tb_usuario WHERE id = $1', [usuario_id]);
    if (usuario.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const result = await pool.query(
      `INSERT INTO tb_historias 
      (usuario_id, imagen, tipoLetra, fondo, video, texto, colortexto, estado, fecha_publicacion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [usuario_id, imagen || null, tipoLetra || null, fondo || null, video || null, texto || null, colortexto || null, 'activo', new Date(),]
    );

    return res.status(201).json({
      message: 'Historia subida exitosamente',
      historia: result.rows[0],
    });
  } catch (error) {
    console.error('Error al subir la historia:', error);
    return res.status(500).json({ message: 'Error al subir la historia' });
  }
};
// Cambiar el estado de las historias a inactivo después de 24 horas
export const actualizarHistorias = async (): Promise<void> => {
  try {
    //const tiempoLimite = new Date(Date.now() - 60 * 1000);
    const tiempoLimite = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await pool.query(
      'UPDATE tb_historias SET estado = $1 WHERE estado = $2 AND fecha_publicacion < $3', ['inactivo', 'activo', tiempoLimite]
    );
  } catch (error) {
    console.error('Error al actualizar las historias:', error);
  }
};
//12h
//setInterval(actualizarHistorias, 1000 * 60 * 60 * 12);
//1min
//setInterval(actualizarHistorias, 1000 * 60);
//1h
setInterval(actualizarHistorias, 1000 * 60 * 60);
// Actualizar el estado favorito de una historia
export const marcarComoFavorita = async (req: Request, res: Response) => {
  const { id } = req.params;
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  try {
    const decodedToken = jwt.verify(token, ConfigEnv.secret_key) as JwtPayload;
    const usuarioId = decodedToken.id;

    const existeFavorito = await pool.query(
      'SELECT * FROM tb_historias_favoritas WHERE historia_id = $1 AND usuario_id = $2',
      [id, usuarioId]
    );

    if (existeFavorito.rows.length > 0) {
      return res.status(400).json({ message: 'Esta historia ya está en tus favoritos' });
    }

    const result = await pool.query(
      'INSERT INTO tb_historias_favoritas (historia_id, usuario_id) VALUES ($1, $2) RETURNING *',
      [id, usuarioId]
    );

    return res.status(200).json({
      message: 'Historia marcada como favorita',
      historia: result.rows[0],
    });
  } catch (error) {
    console.error('Error al marcar como favorita:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const eliminarDeFavoritos = async (req: Request, res: Response) => {
  const { id } = req.params;
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  try {
    const decodedToken = jwt.verify(token, ConfigEnv.secret_key) as JwtPayload; // Cast a JwtPayload
    const usuarioId = decodedToken.id;

    const result = await pool.query(
      'DELETE FROM tb_historias_favoritas WHERE historia_id = $1 AND usuario_id = $2 RETURNING *',
      [id, usuarioId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Historia no encontrada en favoritos' });
    }

    return res.status(200).json({
      message: 'Historia eliminada de favoritos',
      historia: result.rows[0],
    });
  } catch (error) {
    console.error('Error al eliminar de favoritos:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getHistoriasFavoritas = async (req: Request, res: Response): Promise<Response> => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const decodedToken = jwt.verify(token, ConfigEnv.secret_key) as JwtPayload;
    const usuarioId = decodedToken.id;

    const response = await pool.query(
      `SELECT h.id, h.imagen, h.video, h.texto, h.colortexto, h.fecha_publicacion,
              u.nombre AS usuario_nombre
       FROM tb_historias_favoritas hf
       JOIN tb_historias h ON hf.historia_id = h.id
       JOIN tb_usuario u ON h.usuario_id = u.id
       WHERE hf.usuario_id = $1 AND h.estado = 'activo'
       ORDER BY h.fecha_publicacion DESC;`,
      [usuarioId]
    );

    return res.status(200).json(response.rows);
  } catch (error) {
    console.error('Error al obtener historias favoritas: ', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

