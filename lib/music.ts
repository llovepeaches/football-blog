export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
  src: string;
  genre: string;
}

// 示例曲目数据（可替换为真实音频文件路径）
export const playlist: Track[] = [
  {
    id: '1',
    title: 'UEFA Champions League Anthem',
    artist: 'Tony Britten',
    album: '欧冠主题曲',
    duration: '3:12',
    cover: '',
    src: '',
    genre: '足球经典',
  },
  {
    id: '2',
    title: 'Wembley Way',
    artist: 'Football Classics',
    album: '球场之声',
    duration: '4:05',
    cover: '',
    src: '',
    genre: '足球经典',
  },
  {
    id: '3',
    title: 'Allez Allez Allez',
    artist: 'Liverpool FC',
    album: '球迷之歌',
    duration: '3:44',
    cover: '',
    src: '',
    genre: '球迷歌曲',
  },
  {
    id: '4',
    title: 'You\'ll Never Walk Alone',
    artist: 'Gerry & The Pacemakers',
    album: '永不独行',
    duration: '2:48',
    cover: '',
    src: '',
    genre: '球迷歌曲',
  },
  {
    id: '5',
    title: 'We Are The Champions',
    artist: 'Queen',
    album: '冠军之歌',
    duration: '3:00',
    cover: '',
    src: '',
    genre: '励志经典',
  },
];
