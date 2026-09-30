export type Artist = {
  name: string
  color: string
  location: string
  bio: string
  releases: string[]
}
export const artists: Artist[] = [
  { name:'VANTA', color:'#2f6bff', location:'Берлин', bio:'VANTA исследует пересечение звука, пространства и эмоций. Минималистичные структуры здесь сплетаются с глубокими атмосферными текстурами.', releases:['KW001'] },
  { name:'NØR', color:'#9b4dff', location:'Копенгаген', bio:'NØR строит ночные электронные миры из повторов, деталей и пустого пространства.', releases:['KW002'] },
  { name:'LUME', color:'#ff7a1a', location:'Париж', bio:'LUME работает с тёплыми частотами, кинетичными ритмами и осязаемыми текстурами в духе аналогового звука.', releases:['KW003'] },
  { name:'SYNK', color:'#00d5c0', location:'Токио', bio:'SYNK создаёт текучую эмбиент-электронику, в которой ритм и атмосфера непрерывно растворяются друг в друге.', releases:['KW004'] },
  { name:'PANGAEA', color:'#ff4fa8', location:'Лондон', bio:'PANGAEA подходит к электронной музыке как к исследованию давления, движения и пространства.', releases:['KW005'] },
  { name:'DRIFT', color:'#7a5cff', location:'Осло', bio:'DRIFT пишет кинематографичные электронные композиции из фрагментов, отзвуков и развивающихся текстур.', releases:['KW006'] },
]
const decode = (s: string) => { try { return decodeURIComponent(s) } catch { return s } }
export const artistSlug = (a: Artist) => a.name.toLowerCase()
export const getArtist = (slug: string) => artists.find(a => artistSlug(a) === decode(slug).toLowerCase())
