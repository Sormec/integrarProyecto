import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
// import { findUserByEmail } from '../models/User';
import { ConfigEnv } from '../config/constEnv';

// export const login = async (req: Request, res: Response) => {
//   const { email, password } = req.body;

//   try {
//     const user = await findUserByEmail(email);

//     if (!user) {
//       return res.status(401).json({ message: 'Usuario no encontrado' });
//     }

//     if (user.password !== password) {
//       return res.status(401).json({ message: 'Contraseña incorrecta' });
//     }

//     const token = jwt.sign({ id: user.id, email: user.email, nombre: user.nombre }, ConfigEnv.secret_key, {
//       expiresIn: '12h',
//       //expiresIn: '1h',
//     });

//     res.cookie('token', token, {
//       secure: process.env.NODE_ENV === 'production',
//       maxAge: 12 * 60 * 60 * 1000,
//       //maxAge: 3600000,
//   });
  
//     return res.status(200).json({ message: 'Inicio de sesión exitoso', token }); 
//   } catch (error) {
//     console.error('Error en el servidor: ', error);
//     return res.status(500).json({ message: 'Error en el servidor' });
//   }
// };
