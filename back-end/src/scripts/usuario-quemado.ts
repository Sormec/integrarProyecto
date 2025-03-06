import sequelize from "../config/database";
import Usuario from "../models/Usuario";
import { login } from "../controller/login.controller.";

/*
  El siguiente script simula la petición de un inicio de sesión
  para verificar el funcionamiento del login, si no encuentra el usuario
  en la base de datos lo crea en el mismo script.
  El script se ejecuta antes de index.ts 
*/

// Datos del usuario predefinido
const DEFAULT_USER = {
  nombre: "Juan Pérez",
  email: "juan.perez@example.com",
  password: "password123",
};

// Función para crear el usuario
const creaUserQuemado_login = async () => {
  try {
    await sequelize.sync(); // Asegura que la conexión esté lista

    // Verifica si el usuario ya existe
    const userExists = await Usuario.findOne({ where: { email: DEFAULT_USER.email } });

    if (!userExists) {
      // Crea el usuario predefinido
      await Usuario.create({ ...DEFAULT_USER });

      console.log("Usuario predefinido creado con éxito.");
    } else {
      console.log("El usuario predefinido ya existe.");
    }

    // Simulación de una solicitud de inicio de sesión
    const fakeRequest = {
      body: {
        email: DEFAULT_USER.email,
        password: DEFAULT_USER.password
      },
      cookies: {},
    } as any;
  
    const fakeResponse = {
      status: (code: number) => ({
        json: (data: any) => {
          console.log(`🔑 Login Simulado -> Código: ${code}\n`, data);
        },
      }),
      cookie: (name: string, value: string) => {
        // console.log(`🍪 Cookie establecida -> ${name}: ${value}`);
      },
    } as any;
  
    // Llamar al controlador de login
    await login(fakeRequest, fakeResponse);

  } catch (error) {
    console.error(" Error al crear el usuario predefinido:", error);
  }

  //
};

// Ejecuta la función
creaUserQuemado_login();
