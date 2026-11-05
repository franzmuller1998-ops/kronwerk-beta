// Анонс выступления на главной. Чтобы сменить анонс, правьте только этот файл.
// Чтобы скрыть блок целиком, оставьте artists пустым: [].
//
// Файлы лежат в public/ и попадают в образ при сборке (Dockerfile копирует public):
//   public/artists/*.webp  — фото, лучше 800×1000 (4:5), до ~150 КБ
//   public/audio/*.mp3     — отрывок 20–30 с, ~128 kbps (около 400 КБ)
// photo и audio необязательны: без фото покажется цветной фон, без audio не будет кнопки Play.

export type Artist = {
  id: string;
  name: string;
  genre: string;
  photo?: string;
  audio?: string;
  badge?: { src: string; alt: string };
};

export type Announcement = {
  title: string;
  date: string;
  place: string;
  href: string; // куда ведёт кнопка под каруселью
  artists: Artist[];
};

export const announcement: Announcement = {
  title: "Краснодар / Бар X",
  date: "5 декабря, 20:00",
  place: "[Место площадки уточняется]",
  href: "/events",
  artists: [
    {
      id: "artist-1",
      name: "DEXIE 999",
      genre: "Prod. by",
      photo: "/artists/artist-1.webp",
      audio: "/audio/artist-1.mp3",
      badge: {
        src: "/badges/yandex-1500000.webp",
        alt: "1 500 000 прослушиваний на Яндекс Музыке",
      },
    },
    {
      id: "artist-2",
      name: "7nX",
      genre: "Prod. by sockedbeatz & jeweler",
      photo: "/artists/artist-2.webp",
      audio: "/audio/artist-2.mp3",
      badge: {
        src: "/badges/badge_172000.webp",
        alt: "172 000 слушателей на Яндекс Музыке",
      },
    },
    {
      id: "artist-3",
      name: "GLORY O'VISION",
      genre: "Prod. by",
      photo: "/artists/artist-3.webp",
      audio: "/audio/artist-3.mp3",
      badge: {
        src: "/badges/126000_badge.webp",
        alt: "126 000 слушателей на Яндекс Музыке",
      },
    },
    {
      id: "artist-4",
      name: "GUZAR",
      genre: "Prod. by",
      photo: "/artists/artist-4.webp",
      audio: "/audio/artist-4.mp3",
      badge: {
        src: "/badges/90000_badge.webp",
        alt: "90 000 слушателей на Яндекс Музыке",
      },
    },
    {
      id: "artist-5",
      name: "Lenyxx",
      genre: "Prod. by",
      photo: "/artists/artist-5.webp",
      audio: "/audio/artist-5.mp3",
    },
    {
      id: "artist-6",
      name: "CORRIDA",
      genre: "Prod. by",
      photo: "/artists/artist-6.webp",
      audio: "/audio/artist-6.mp3",
    },
    {
      id: "artist-7",
      name: "Oxy & fuckclubb",
      genre: "Prod. by",
      photo: "/artists/artist-7.webp",
      audio: "/audio/artist-7.mp3",
    },
    {
      id: "artist-8",
      name: "Path2Glory_505",
      genre: "Prod. by",
      photo: "/artists/artist-8.webp",
      audio: "/audio/artist-8.mp3",
    },
    {
      id: "artist-9",
      name: "Gelato Kush",
      genre: "Prod. by",
      photo: "/artists/artist-9.webp",
      audio: "/audio/artist-9.mp3",
    },
    {
      id: "artist-10",
      name: "Gettaswag",
      genre: "Prod. by",
      photo: "/artists/artist-10.webp",
      audio: "/audio/artist-10.mp3",
    },
    {
      id: "artist-11",
      name: "79KUSH",
      genre: "Prod. by SHVZVRA",
      photo: "/artists/artist-11.webp",
      audio: "/audio/artist-11.mp3",
    },
    {
      id: "artist-12",
      name: "DahMic",
      genre: "Prod. by",
      photo: "/artists/artist-12.webp",
      audio: "/audio/artist-12.mp3",
    },
  ],
};
