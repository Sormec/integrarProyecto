export interface Historia {
    id: number;
    usuario_id: number;
    usuario_nombre: string; // en la tabla solo esta el ID
    modo: string; // identifica si la historia es de tipo (foto,texto,video)
    tipoLetra?: string;
    fondo?: string;
    texto?: string;
    colorTexto?: string;
    video?: string;
    imagen?: string;
    fecha_creacion: string;
    favorito: boolean;

}

export interface HistoriasPorUsuarioMap {
    [key: string]: Historia[];
}