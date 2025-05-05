// src/app/(protected)/movies/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { movieService } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Pencil,
  Trash,
  Star,
  Calendar,
  Clock,
  DollarSign,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Movie = {
  id: string;
  title: string;
  originalTitle?: string;
  releaseDate: string;
  overview: string;
  posterUrl?: string;
  budget?: number;
  runtime?: number;
  score?: number;
};

export default function MovieDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const fetchMovie = async () => {
      try {
        setLoading(true);
        const response = await movieService.getById(params.id);
        setMovie(response.data);
      } catch (error) {
        console.error("Error fetching movie:", error);
        toast.error("Failed to load movie details");
        router.push("/movies");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [isAuthenticated, params.id, router]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await movieService.delete(params.id);
      toast.success("Movie deleted successfully");
      router.push("/movies");
    } catch (error) {
      console.error("Error deleting movie:", error);
      toast.error("Failed to delete movie");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 animate-pulse">
        <div className="h-8 w-32 bg-muted rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="aspect-[2/3] bg-muted rounded-lg"></div>
          <div className="md:col-span-2 space-y-6">
            <div className="h-10 w-3/4 bg-muted rounded"></div>
            <div className="h-6 w-1/2 bg-muted rounded"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded"></div>
              <div className="h-4 w-full bg-muted rounded"></div>
              <div className="h-4 w-3/4 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-medium">Movie not found</h2>
          <p className="text-muted-foreground mt-2">
            {`The movie you're looking for doesn't exist or has been removed.`}
          </p>
          <Button className="mt-4" onClick={() => router.push("/movies")}>
            Back to Movies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        className="mb-8 pl-0"
        onClick={() => router.push("/movies")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Movies
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="aspect-[2/3] relative bg-muted rounded-lg overflow-hidden">
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-muted-foreground">No poster available</span>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h1 className="text-3xl font-bold">{movie.title}</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/movies/edit/${movie.id}`)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {movie.originalTitle && movie.originalTitle !== movie.title && (
            <p className="text-lg text-muted-foreground mb-4">
              Original Title: {movie.originalTitle}
            </p>
          )}

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
              {format(new Date(movie.releaseDate), "MMMM d, yyyy")}
            </div>

            {movie.runtime && (
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                {movie.runtime} min
              </div>
            )}

            {movie.score !== undefined && (
              <div className="flex items-center text-sm">
                <Star
                  className="h-4 w-4 mr-1 text-yellow-500"
                  fill="currentColor"
                />
                {movie.score.toFixed(1)}/10
              </div>
            )}

            {movie.budget && (
              <div className="flex items-center text-sm">
                <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(movie.budget)}
              </div>
            )}
          </div>

          <h2 className="text-xl font-semibold mb-2">Overview</h2>
          <p className="text-muted-foreground whitespace-pre-line">
            {movie.overview}
          </p>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this movie?
            </DialogTitle>
            <DialogDescription>
              {`This action cannot be undone. This will permanently delete the
              movie "${movie.title}" from the database.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
