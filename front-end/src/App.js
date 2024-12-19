import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom"
//import {Historias} from './componentes/Historias'
import {Historias} from './SRP/Historias/Historias.js'
//import Login from './componentes/Login';
import Login from './SRP/Login/Login.js';
//import {VistaUsuario} from './componentes/Vista_Usuarios';
import {VistaUsuario} from './SRP/VistasU/Vista_Usuario.js';
//import {Crear} from './componentes/Crear';
import {Crear} from './SRP/Crear/Crear.js';
//import {Amigos} from './componentes/Amigos';
import {Amigos} from './SRP/Amigos/Amigos.js';
//import {VistaFavoritos} from './componentes/Vista_Favoritos';
import {VistaFavoritos} from './SRP/VistasF/Vista_Favoritos.js';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login/>}/>
          <Route path="/historias" element={<Historias />} />
          <Route path="/vista/:id" element={<VistaUsuario />} />
          <Route path="/crear-historia" element={<Crear/>} />
          <Route path="/amigos" element={<Amigos/>} />
          <Route path="/Vista_Favoritos/:id" element={<VistaFavoritos />} />
          </Routes>
      </BrowserRouter>

    </div>
  );
}

export default App;
