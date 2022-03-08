export interface Rate {
  id: string;

  title: string;
  count: number;
  date: string;
  deadline?: string;

  songs: Song[];
  playlist: Playlist;

  ratings: SongRating[];
}

export interface Playlist {
  url: string;
  id: string;
}

export interface Song {
  link: string;
  submittedBy: string;
  trackName?: string;
  artist?: string;
  rating?: number;
}

export interface SongRating {
  id: string;
  value: number;
  submittedBy?: string;
}

export interface HomePageRate {
  date: string;
  deadline: string;
  id: string;
  playlist: {
    id: string;
    url: string;
  };
  title: string;
}
