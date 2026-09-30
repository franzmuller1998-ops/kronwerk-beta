export type Track = { title: string; duration: string }
export type Release = {
  id: string
  artist: string
  title: string
  year: number
  colors: [string, string, string]
  tracks: Track[]
  description: string
}

export const releases: Release[] = [
  { id: 'KW001', artist: 'VANTA', title: 'Aether', year: 2026, colors: ['#1d4dff', '#7a3cff', '#00d5ff'], tracks: [{title:'Aether',duration:'05:32'},{title:'Drift',duration:'04:48'},{title:'Horizon',duration:'06:21'},{title:'Pulse',duration:'05:03'}], description:'Aether исследует пересечение звука, пространства и эмоций через глубокие атмосферные электронные текстуры.' },
  { id: 'KW002', artist: 'NØR', title: 'Echoes', year: 2026, colors: ['#7a3cff', '#ff3cc8', '#2a5cff'], tracks: [{title:'Echoes',duration:'05:32'},{title:'Static',duration:'04:48'},{title:'Signal',duration:'06:21'},{title:'Afterimage',duration:'05:03'}], description:'Ночное исследование повторов, пространства и светящихся электронных текстур.' },
  { id: 'KW003', artist: 'LUME', title: 'Nexus', year: 2025, colors: ['#ff3b1f', '#ff8a1f', '#ff2e88'], tracks: [{title:'Nexus',duration:'05:10'},{title:'Ember',duration:'04:22'},{title:'Arc',duration:'06:04'},{title:'Heat',duration:'04:56'}], description:'Тёплые частоты и кинетичные ритмы для пространства между движением и покоем.' },
  { id: 'KW004', artist: 'SYNK', title: 'Lucid', year: 2025, colors: ['#00e0c0', '#0a7cff', '#00a3a3'], tracks: [{title:'Lucid',duration:'05:44'},{title:'Current',duration:'05:12'},{title:'Tide',duration:'06:02'},{title:'Surface',duration:'04:41'}], description:'Текучий сборник эмбиент-электроники, глубоких пульсаций и ясных атмосфер.' },
  { id: 'KW005', artist: 'PANGAEA', title: 'Tidal', year: 2024, colors: ['#3c6cff', '#ff4fa8', '#ffb36b'], tracks: [{title:'Tidal',duration:'05:08'},{title:'Continental',duration:'04:50'},{title:'Lowline',duration:'06:14'},{title:'Shore',duration:'05:20'}], description:'Неспешный электронный пейзаж, сформированный давлением, расстоянием и светом.' },
  { id: 'KW006', artist: 'DRIFT', title: 'Fragments', year: 2024, colors: ['#5a3cff', '#c23cff', '#2a7cff'], tracks: [{title:'Fragments',duration:'05:36'},{title:'Trace',duration:'04:38'},{title:'Memory',duration:'06:11'},{title:'Fade',duration:'05:27'}], description:'Фрагменты ритма и текстуры, собранные в глубокое кинематографичное электронное путешествие.' },
]
export const getRelease = (id: string) => releases.find(r => r.id.toLowerCase() === id.toLowerCase())
