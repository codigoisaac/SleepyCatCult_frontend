import Image from "next/image";
import { format } from "date-fns";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type MovieCardProps = {
  movie: {
    id: number;
    title: string;
    releaseDate: string;
    coverImage: string;
    score: number;
    duration: number;
  };
  onClick: () => void;
};

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h${remainingMinutes.toString().padStart(2, "0")}m`;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  return (
    <Card
      className="overflow-hidden transition-shadow hover:shadow-lg cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] w-full bg-muted">
        {movie.coverImage ? (
          <Image
            src={movie.coverImage}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-muted-foreground">No poster</span>
          </div>
        )}
        {movie.score !== undefined && (
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full py-1 px-2 flex items-center">
            <Star
              className="h-3 w-3 text-yellow-500 mr-1"
              fill="currentColor"
            />
            <span className="text-xs font-medium">
              {movie.score.toFixed(1)}
            </span>
          </div>
        )}
      </div>
      <CardContent className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-semibold truncate">{movie.title}</h3>
          <p className="text-sm text-muted-foreground">
            {format(new Date(movie.releaseDate), "dd/MMyyyy")} •{" "}
            {formatDuration(movie.duration)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
