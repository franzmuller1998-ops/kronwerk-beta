export type Artist = {
  name: string
  color: string
  location: string
  bio: string
  releases: string[]
}
export const artists: Artist[] = [
  { name:'VANTA', color:'#2f6bff', location:'Berlin', bio:'VANTA explores the intersection of sound, space and emotion. The work blends minimal structures with deep, atmospheric textures.', releases:['KW001'] },
  { name:'NØR', color:'#9b4dff', location:'Copenhagen', bio:'NØR builds nocturnal electronic worlds from repetition, detail and negative space.', releases:['KW002'] },
  { name:'LUME', color:'#ff7a1a', location:'Paris', bio:'LUME works with warm frequencies, kinetic rhythms and tactile analogue-inspired textures.', releases:['KW003'] },
  { name:'SYNK', color:'#00d5c0', location:'Tokyo', bio:'SYNK creates fluid ambient electronics where rhythm and atmosphere continuously dissolve into one another.', releases:['KW004'] },
  { name:'PANGAEA', color:'#ff4fa8', location:'London', bio:'PANGAEA approaches electronic music as a study of pressure, movement and space.', releases:['KW005'] },
  { name:'DRIFT', color:'#7a5cff', location:'Oslo', bio:'DRIFT creates cinematic electronic compositions built from fragments, echoes and evolving textures.', releases:['KW006'] },
]
const decode = (s: string) => { try { return decodeURIComponent(s) } catch { return s } }
export const artistSlug = (a: Artist) => a.name.toLowerCase()
export const getArtist = (slug: string) => artists.find(a => artistSlug(a) === decode(slug).toLowerCase())
