import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ConfigEnv } from '../config/constEnv';
import Usuario from "../models/Usuario";

// Inicia sesión y si es correcto se crea un token con jwt
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Consulta el registro donde este el mismo email,
    // similar a SELECT * FROM tb_usuario WHERE email == 'email'
    const user = await Usuario.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, nombre: user.nombre },
      ConfigEnv.secret_key,
      { expiresIn: "12h" }
      //expiresIn: "1h"
    );
    
    // Guarda el token en una cookie
    res.cookie("token", token, {
      secure: process.env.NODE_ENV === "production",
      maxAge: 12 * 60 * 60 * 1000
      //maxAge: 3600000
    });
  
    return res.status(200).json({ message: 'Inicio de sesión exitoso', token }); 
  } catch (error) {
    console.error('Error en el servidor: ', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};
