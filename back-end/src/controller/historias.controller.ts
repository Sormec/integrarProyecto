import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import Historia from "../models/Historia";
import HistoriaFavorita from "../models/HistoriaFavorita";
import Usuario from "../models/Usuario";
import Amigo from '../models/Amigo';
import { Op, col, fn } from "sequelize";

// Obtiene historias del usuario y sus amigos
export const leerHistorias = async (req: Request, res: Response): Promise<Response> => {
  try {
    // const token = req.cookies.token || req.body.token;
    // if (!token) {
    //   return res.status(401).json({ message: 'No autenticado' });
    // }
    // Decodificar el token para obtener el ID del usuario autenticado
    // const decodedToken = jwt.verify(token, ConfigEnv.secret_key) as JwtPayload;
    
    // Extraer usuario_id de los parámetros de consulta en lugar del cuerpo de la solicitud
    const usuario_id = parseInt(req.query.usuario_id as string, 10);

    // Verificar si usuario_id es válido
    if (isNaN(usuario_id)) {
      return res.status(400).json({ message: "El usuario_id es requerido y debe ser un número válido." });
    }

    // Obtener variable de la petición para mayor legibilidad
    const var_usuario = usuario_id;

    // Obtener los IDs de los amigos del usuario autenticado
    const amigos = await Amigo.findAll({
      where: {
        [Op.or]: [
          { usuario_id: var_usuario },
          { amigo_id: var_usuario },
        ],
      },
    });

    // Extraer solo los IDs de amigos
    const amigosIds = amigos.map((amigo) =>
      amigo.usuario_id === var_usuario ? amigo.amigo_id : amigo.usuario_id
    );

    // Obtener historias del usuario y sus amigos
    const historias = await Historia.findAll({
      attributes: [
        [col("Usuario.nombre"), "usuario_nombre"], // Nombre del usuario al inicio
        "id",
        "imagen",
        "video",
        "texto",
        "colortexto",
        "fecha_publicacion",
        "favorito",
        "estado",
        [
          fn("COUNT", col("Historia.id")), // Contador de historias por usuario
          "total_historias",
        ],
      ],
      include: [
        {
          model: Usuario,
          attributes: [], // Evita anidar los datos dentro de Usuario
          required: true,
        },
      ],
      where: {
        [Op.or]: [
          { usuario_id: var_usuario }, // Historias propias
          { usuario_id: { [Op.in]: amigosIds } }, // Historias de amigos
        ],
        estado: "activo",
      },
      order: [["fecha_publicacion", "DESC"]],
      group: ["Historia.id", "Usuario.nombre"], // Agrupar por historia y usuario
    });

    return res.status(200).json(historias);    
  } catch (error) {
    console.error('Error al obtener las historias: ', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Subir nueva historia
export const crearHistoria = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { usuario_id, imagen, tipoLetra, fondo, video, texto, colortexto } = req.body;

    // Validación de datos obligatorios
    if (!usuario_id || (!imagen && !video && !texto)) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Verificar si el usuario existe
    const usuario = await Usuario.findByPk(usuario_id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Crear la historia con Sequelize
    const historia = await Historia.create({
      usuario_id,
      imagen: imagen || null,
      tipoletra: tipoLetra || null,
      fondo: fondo || null,
      video: video || null,
      texto: texto || null,
      colortexto: colortexto || null,
      estado: "activo",
      fecha_publicacion: new Date(),
    });

    return res.status(201).json({
      message: "Historia subida exitosamente",
      historia,
    });
  } catch (error) {
    console.error("Error al subir la historia:", error);
    return res.status(500).json({ message: "Error al subir la historia" });
  }
};
// Subir nueva historia solo de tipo 'foto'
export const crearHistoriaImagen = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { usuario_id, tipoLetra, fondo, texto, colortexto } = req.body;
    const imagenVar = req.file;
    
    // Validación de datos obligatorios
    if (!usuario_id || !imagenVar) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }
    
    // Verificar si el usuario existe
    const usuario = await Usuario.findByPk(usuario_id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Obtener la URL base del servidor dinámicamente
    const host = req.protocol + "://" + req.get("host"); // Obtiene el host desde la petición
    const imagenNombre = imagenVar.filename;
    const imagenUrl = `${host}/api/imagenesGuardadas/${imagenNombre}`; // URL completa de la imagen


    // Crear la historia con arhivo de imagen y Sequelize
    const historia = await Historia.create({
      usuario_id,
      imagen: imagenUrl || null,
      tipoletra: tipoLetra || null,
      fondo: fondo || null,
      texto: texto || null,
      colortexto: colortexto || null,
      estado: "activo",
      fecha_publicacion: new Date(),
    });

    return res.status(201).json({
      message: "Historia con foto subida exitosamente",
      historia,
    });
  } catch (error) {
    console.error("Error al subir la historia:", error);
    return res.status(500).json({ message: "Error al subir la historia" });
  }
};

// Cambiar el estado de las historias a inactivo después de 24 horas
export const actualizarHistorias = async (): Promise<void> => {
  try {
    // Calcular el tiempo límite (24 horas antes de la hora actual)
    // const tiempoLimite = new Date(Date.now() - 1000 * 60 * 5); // 5min
    const tiempoLimite = new Date(Date.now() - 1000 * 60 * 60 * 24); // 24h

    // Actualizar historias que cumplan con la condición
    await Historia.update(
      { estado: "inactivo" }, // Valor nuevo a actualizar
      {
        where: {
          estado: "activo",
          fecha_publicacion: { [Op.lt]: tiempoLimite }, // `Op.lt` = menor que
        },
      }
    );

    console.log("Historias actualizadas correctamente.");
  } catch (error) {
    console.error('Error al actualizar las historias:', error);
  }
};
// La función ejecuta 'actualizarHistorias' de manera repetita en un intervalo de tiempo
// setInterval(actualizarHistorias, 1000 * 60 * 60 * 12); //12h
// setInterval(actualizarHistorias, 1000 * 60 * 60); // 1h
// setInterval(actualizarHistorias, 1000 * 60); // 1min

// Elimina una historia por su id especifico
export const eliminarHistoria = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params; // Capturar el ID de la historia desde la URL
    // Buscar la historia por ID
    const historia = await Historia.findByPk(id);

    if (!historia) {
      return res.status(404).json({ message: "Historia no encontrada" });
    }

    // Eliminar la historia
    await historia.destroy();

    return res.status(200).json({ message: "Historia eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la historia:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtiene historias favoritas del usuario
export const leerHistoriasFavoritas = async (req: Request, res: Response): Promise<Response> => {
  try {    
    // const { usuario_id } = req.body;

    const usuario_id = parseInt(req.query.usuario_id as string, 10);

    // Verificar si usuario_id es válido
    if (isNaN(usuario_id)) {
      return res.status(400).json({ message: "El usuario_id es requerido y debe ser un número válido." });
    }
    // Obtener variables de la petición para mayor legibilidad
    const var_usuario = usuario_id;
    
    // La consulta es más fácil si se realiza a la tabla Historias
    const historiasFavoritas = await Historia.findAll({
      attributes: [
        "id",
        "imagen",
        "video",
        "texto",
        "colortexto",
        "fecha_publicacion",
        "estado",
        "favorito",
        "usuario_id"
      ],
      include: [
        {
          model: HistoriaFavorita,
          where: { usuario_id: var_usuario }, // Se verifica que la historiaFav sea del usuario correspondiente
          attributes: [],
        },
        {
          model: Usuario,
          attributes: ["nombre"],
        },
      ],
      where: { estado: "activo" },
      order: [["fecha_publicacion", "DESC"]],
    });

    // Si no hay historias favoritas
    if (historiasFavoritas.length === 0) {
      return res.status(404).json({ message: "No tienes historias favoritas" });
    }

    return res.status(200).json(historiasFavoritas);
  } catch (error) {
    console.error('Error al obtener historias favoritas: ', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crea un nuevo registro Historia Favorita
export const crearHistoriaFavorita = async (req: Request, res: Response) => {
  try {
    const { historia_id, usuario_id } = req.body;
    // Obtener variables de la petición para mayor legibilidad
    const var_historia = historia_id;
    const var_usuario = usuario_id;

    // Verificar si ya existe en favoritos
    const existeFavorito = await HistoriaFavorita.findOne({
      where: {
        historia_id: var_historia,
        usuario_id: var_usuario
      },
    });

    if (existeFavorito) {
      return res.status(400).json({ message: "La historia ya está en favoritos" });
    }

    // Agregar la historia a favoritos
    const nuevaFavorita = await HistoriaFavorita.create({
      historia_id: var_historia,
      usuario_id: var_usuario,
    });

    // Actualizar el registro de la nueva historia favorita
    await Historia.update(
      { favorito: true },
      {
        where:{
          id: var_historia
        }
      }
    );

    return res.status(201).json({
      message: "Historia marcada como favorita",
      HistoriaFavorita: nuevaFavorita,
    });
  } catch (error) {
    console.error('Error al marcar como favorita:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Elimina una historia favorita por su id especifico
export const eliminarHistoriaFavorita = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Buscar la historia favorita por su ID
    const historiaFavorita = await HistoriaFavorita.findByPk(id);

    if (!historiaFavorita) {
      return res.status(404).json({ message: "Historia favorita no encontrada" });
    }

    // Eliminar la historia favorita
    await historiaFavorita.destroy();

    return res.status(200).json({ message: "Historia favorita eliminada correctamente" });
  } catch (error) {
    console.error('Error al eliminar de favoritos:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
