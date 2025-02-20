export interface Historia {
    id: number;
    usuario_nombre: string;
    imagen?: string;
    video?: string;
    texto?: string;
    colortexto?: string;
    fecha_creacion: string;
    favorito: boolean;

}

export interface HistoriasPorUsuarioMap {
    [key: string]: Historia[];
}