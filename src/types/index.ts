/**
 * Tipos compartidos del dominio de GLearning (guitarra eléctrica).
 */

/** Notas cromáticas usando sostenidos como nombre canónico. */
export type Note = "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B";

export type Difficulty = "beginner" | "intermediate" | "advanced";

/** Categorías principales de contenido de la app. */
export type Category = "scales" | "modes" | "tablature" | "sheet-music" | "chords";

/** Familia a la que pertenece una escala (para agrupar en el menú). */
export type ScaleFamily =
    | "Pentatónicas y blues"
    | "Modos griegos"
    | "Modos menor melódica"
    | "Modos menor armónica"
    | "Modos armónica mayor"
    | "Modos doble armónica"
    | "Simétricas"
    | "Exóticas y del mundo"
    | "Bebop / jazz";

/**
 * Definición de una escala: patrón de intervalos en semitonos desde la tónica
 * (p.ej. mayor = [0,2,4,5,7,9,11]). La tónica la elige el usuario en tiempo de uso,
 * por eso no vive aquí.
 */
export interface ScaleDef {
    id: string;
    name: string;
    /** Familia para agrupar en el menú. */
    family: ScaleFamily;
    /** Intervalos en semitonos desde la tónica (incluye el 0). */
    intervals: number[];
    /** Fórmula legible, p.ej. "1 - b3 - 4 - 5 - b7". */
    formula: string;
    difficulty: Difficulty;
    description: string;
    /** Géneros donde es habitual (para etiquetar). */
    genres: string[];
}

/**
 * Afinación de guitarra. `strings` son los tonos de las cuerdas al aire, con octava
 * científica, ordenados de la más grave a la más aguda (p.ej. Mi estándar =
 * ["E2","A2","D3","G3","B3","E4"]). Soporta 6 y 7 cuerdas.
 */
export interface Tuning {
    id: string;
    name: string;
    strings: string[];
}

/** Posición concreta de una nota en el mástil. */
export interface FretPosition {
    stringIndex: number;
    fret: number;
    /** Tono con octava, p.ej. "A2" (para audio). */
    pitch: string;
    note: Note;
    isRoot: boolean;
    /** Grado dentro de la escala, p.ej. "b3". */
    degree: string;
}

/** Un modo griego, derivado de la escala mayor. */
export interface Mode {
    id: string;
    name: string;
    /** Grado sobre el que se construye (1 = jónico, 2 = dórico, ...). */
    degree: number;
    intervals: number[];
    character: string;
    difficulty: Difficulty;
}

/** Familia a la que pertenece un acorde (para agrupar en la barra lateral). */
export type ChordFamily =
    | "Mayores"
    | "Menores"
    | "Power chords (5)"
    | "Dominantes (7)"
    | "Novena (9)"
    | "Séptima mayor (maj7)"
    | "Séptima menor (m7)"
    | "Sextas (6)"
    | "Añadida (add9)"
    | "Suspendidos (sus)"
    | "Semidisminuido (m7b5)"
    | "Aumentados"
    | "Disminuidos"
    | "Disminuido 7 (dim7)";

/**
 * Digitación de un acorde para guitarra de 6 cuerdas.
 * `frets`: traste por cuerda de la 6ª (Mi grave) a la 1ª (Mi agudo).
 *   -1 = cuerda al aire silenciada (muteada), 0 = al aire.
 * `fingers`: dedo sugerido por cuerda (0 = ninguno/al aire).
 */
export interface Chord {
    id: string;
    name: string;
    root: Note;
    quality: string;
    family: ChordFamily;
    /** Traste por cuerda (6ª→1ª). 6 valores. */
    frets: number[];
    /** Dedo por cuerda (6ª→1ª). 6 valores. */
    fingers: number[];
    /** Traste base del diagrama (1 por defecto). */
    baseFret: number;
    difficulty: Difficulty;
}

/**
 * Forma móvil de acorde: un patrón de trastes relativo al traste de la tónica sobre una
 * cuerda de referencia (6ª o 5ª). Transponiéndola se obtiene el acorde en cualquier
 * tónica. `relFrets`/`fingers` van de la 6ª a la 1ª cuerda; -1 = muteada.
 */
export interface ChordShape {
    id: string;
    family: ChordFamily;
    quality: string;
    /** Sufijo que se concatena a la tónica para el nombre (p.ej. "m7", "5", ""). */
    suffix: string;
    /** Etiqueta de la forma, p.ej. "Forma E (bordón 6ª)". */
    shapeLabel: string;
    /** Cuerda de referencia donde va la tónica: 0 = 6ª (Mi), 1 = 5ª (La), 2 = 4ª (Re). */
    rootString: 0 | 1 | 2;
    /** Trastes relativos al traste de la tónica (0). -1 = muteada. */
    relFrets: number[];
    fingers: number[];
    difficulty: Difficulty;
}

/** Acorde abierto (posición fija): un `Chord` con la etiqueta de forma. */
export type OpenChord = Chord & { shapeLabel: string };

/** Un modo dentro de una familia, con su metadata educativa. */
export interface ModeView {
    id: string;
    name: string;
    parent: string;
    degree: number;
    intervals: number[];
    formula: string;
    difficulty: Difficulty;
    genres: string[];
    charLabel: string;
    charSemitone: number;
    mood: string;
    chord: string;
    vamp?: string;
    examples?: string;
    brightness: number;
}

/** Familia de modos (escala madre) con sus modos. */
export interface ModeFamily {
    family: ScaleFamily;
    label: string;
    parent: string;
    modes: ModeView[];
}

/** Una tablatura simple: cada línea es una cuerda con su contenido ASCII. */
export interface Tab {
    id: string;
    title: string;
    artist?: string;
    tuning: Note[];
    /** Bloques de compases en texto (tab ASCII). */
    lines: string[];
    difficulty: Difficulty;
}

/** Referencia a una partitura (imagen/PDF/MusicXML) con metadatos. */
export interface SheetPiece {
    id: string;
    title: string;
    composer?: string;
    keySignature: string;
    tempo: number;
    difficulty: Difficulty;
    assetUrl?: string;
}

/** Tarjeta genérica de lección para listados y el home. */
export interface LessonCard {
    id: string;
    title: string;
    category: Category;
    difficulty: Difficulty;
    summary: string;
}

// ================================================================
// Usuarios y autenticación (espejan el backend CodeIgniter 4)
// ================================================================

export type UserRole = "user" | "admin";

/** Usuario tal como lo expone el backend (formatUserPublic, camelCase). */
export interface User {
    id: number;
    email: string;
    name: string;
    role: UserRole;
    avatar: string | null;
    isActive: boolean;
    lastLogin: string | null;
    createdAt: string | null;
}

export interface AuthSession {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

/** Actualización de perfil del propio usuario (PUT /api/auth/profile). */
export interface UpdateProfileRequest {
    name?: string;
    email?: string;
}

/** Cambio de contraseña del propio usuario (PUT /api/auth/password). */
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

/** Lista paginada (offset/limit) de GET /api/admin/users. */
export interface UserListPayload {
    users: User[];
    total: number;
    limit: number;
    offset: number;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}

// ================================================================
// Escalas personalizadas (creadas por el usuario)
// ================================================================

/** Una nota concreta en la tablatura: índice de cuerda (0 = la más grave) y traste. */
export interface TabNote {
    string: number;
    fret: number;
}

/**
 * Escala creada por un usuario como una SECUENCIA de notas (cuerda + traste) sobre una
 * afinación. Espeja CustomScaleModel::formatPublic (camelCase). La afinación se guarda
 * denormalizada (`tuningId`, `tuningName`, `strings`) para renderizar la tablatura de forma
 * autónoma. `ownerName`/`ownerEmail` solo llegan en el listado de administración.
 */
export interface CustomScale {
    id: number;
    userId: number;
    name: string;
    tuningId: string;
    tuningName: string;
    /** Cuerdas al aire con octava, de la más grave a la más aguda. */
    strings: string[];
    /** Secuencia de notas en el orden en que se tocan. */
    notes: TabNote[];
    /**
     * Divisores cosméticos: cada valor es el nº de notas que quedan a su izquierda (0..N), y se
     * dibuja como una línea vertical en ese hueco de la tablatura. No afectan la reproducción.
     */
    dividers: number[];
    description: string | null;
    difficulty: Difficulty;
    createdAt: string | null;
    updatedAt: string | null;
    ownerName?: string;
    ownerEmail?: string;
}

export interface CreateCustomScaleRequest {
    name: string;
    tuningId: string;
    tuningName: string;
    strings: string[];
    notes: TabNote[];
    dividers?: number[];
    description?: string | null;
    difficulty?: Difficulty;
}

/** Actualización parcial; solo los campos presentes se modifican. */
export interface UpdateCustomScaleRequest {
    name?: string;
    tuningId?: string;
    tuningName?: string;
    strings?: string[];
    notes?: TabNote[];
    dividers?: number[];
    description?: string | null;
    difficulty?: Difficulty;
}

/** Lista paginada (offset/limit) de GET /api/admin/custom-scales. */
export interface CustomScaleListPayload {
    scales: CustomScale[];
    total: number;
    limit: number;
    offset: number;
}

/** Actualización parcial; solo los campos presentes se modifican. */
export interface UpdateUserRequest {
    name?: string;
    email?: string;
    role?: UserRole;
    password?: string;
}

/**
 * Contenido editable de la Home (tablas contents_features / contents_highlights).
 * `icon` es el nombre de un icono de lucide-react (ej. "AudioLines"), mapeado a
 * su componente en el front.
 */
export interface HomeFeature {
    id: number;
    title: string;
    description: string;
    to: string;
    icon: string;
}

export interface HomeHighlight {
    id: number;
    title: string;
    description: string;
    icon: string;
}

/**
 * Sección de ayuda de un módulo (tabla contents_help). Cada módulo ("custom-scales", …)
 * tiene varias secciones que se muestran en su pop-up de ayuda. `icon` es el nombre de
 * un icono de lucide-react, mapeado a su componente en el front.
 */
export interface HelpSection {
    id: number;
    title: string;
    content: string;
    icon: string;
}
