export type MovieForm = {
  title: string;
  originalTitle: string;
  releaseDate: string;
  synopsis: string;
  budget: number;
  duration: number;
  score: number;
  popularity: number;
  voteCount: number;
  tagline: string;
  genres: string[];
  status: string;
  language: string;
  revenue: number;
  profit: number;
  trailerUrl: string;
};

export type Movie = MovieForm & {
  id: number;
  userId: number;
  coverImageUrl: string;
  createdAt: string;
  updatedAt: string;
};
