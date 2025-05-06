"use client";

import { Movie } from "@/types/movie";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface MovieDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movie?: Movie;
  mode: "create" | "edit";
}

export function MovieDialog({
  open,
  onOpenChange,
  movie,
  mode,
}: MovieDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        title: formData.get("title"),
        originalTitle: formData.get("originalTitle"),
        popularity: Number(formData.get("popularity")),
        voteCount: Number(
          formData.get("voteCount")?.toString().replace(/\D/g, ""),
        ),
        budget: Number(
          formData.get("budget")?.toString().replace(/[^\d]/g, ""),
        ),
        revenue: Number(
          formData.get("revenue")?.toString().replace(/[^\d]/g, ""),
        ),
        profit: Number(
          formData.get("profit")?.toString().replace(/[^\d]/g, ""),
        ),
        score: Number(formData.get("score")),
        tagline: formData.get("tagline"),
        synopsis: formData.get("synopsis"),
        genres: formData
          .get("genres")
          ?.toString()
          .split(",")
          .map((g) => g.trim()),
        releaseDate: formData.get("releaseDate"),
        duration: Number(formData.get("duration")),
        status: formData.get("status"),
        language: formData.get("language"),
        trailerUrl: formData.get("trailerUrl"),
      };

      const url =
        mode === "create" ? "/api/movies" : `/api/movies/${movie?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      router.refresh();
      onOpenChange(false);
    } catch (error) {
      console.error(`Failed to ${mode} movie:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Movie" : "Edit Movie"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new movie to the database."
              : "Make changes to the movie information below."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={movie?.title}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalTitle">Original Title</Label>
              <Input
                id="originalTitle"
                name="originalTitle"
                defaultValue={movie?.originalTitle}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" name="tagline" defaultValue={movie?.tagline} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genres">Genres (comma-separated)</Label>
            <Input
              id="genres"
              name="genres"
              defaultValue={movie?.genres.join(", ")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="synopsis">Synopsis</Label>
            <Textarea
              id="synopsis"
              name="synopsis"
              defaultValue={movie?.synopsis}
              className="h-20"
              maxLength={1000}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="popularity">Popularity</Label>
              <Input
                type="number"
                id="popularity"
                name="popularity"
                defaultValue={movie?.popularity}
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voteCount">Vote Count</Label>
              <Input
                type="text"
                id="voteCount"
                name="voteCount"
                defaultValue={
                  movie?.voteCount
                    ? movie.voteCount.toLocaleString("en-US").replace(/,/g, ".")
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  e.target.value = value
                    ? parseInt(value).toLocaleString("en-US").replace(/,/g, ".")
                    : "";
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="score">Score (0-100)</Label>
              <Input
                type="number"
                id="score"
                name="score"
                defaultValue={movie?.score}
                min="0"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="releaseDate">Release Date</Label>
              <Input
                type="date"
                id="releaseDate"
                name="releaseDate"
                defaultValue={movie?.releaseDate?.split("T")[0]}
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => {
                  e.target.type = "text";
                  if (e.target.value) {
                    const date = new Date(e.target.value);
                    e.target.value = date.toLocaleDateString("en-US");
                  }
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                type="number"
                id="duration"
                name="duration"
                defaultValue={movie?.duration}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input id="status" name="status" defaultValue={movie?.status} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                name="language"
                defaultValue={movie?.language}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                type="text"
                id="budget"
                name="budget"
                defaultValue={
                  movie?.budget
                    ? `U$ ${movie.budget
                        .toLocaleString("en-US")
                        .replace(/,/g, ".")},00`
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, "");
                  e.target.value = value
                    ? `U$ ${parseInt(value)
                        .toLocaleString("en-US")
                        .replace(/,/g, ".")},00`
                    : "";
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="revenue">Revenue</Label>
              <Input
                type="text"
                id="revenue"
                name="revenue"
                defaultValue={
                  movie?.revenue
                    ? `U$ ${movie.revenue
                        .toLocaleString("en-US")
                        .replace(/,/g, ".")},00`
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, "");
                  e.target.value = value
                    ? `U$ ${parseInt(value)
                        .toLocaleString("en-US")
                        .replace(/,/g, ".")},00`
                    : "";
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profit">Profit</Label>
              <Input
                type="text"
                id="profit"
                name="profit"
                defaultValue={
                  movie?.profit
                    ? `U$ ${movie.profit
                        .toLocaleString("en-US")
                        .replace(/,/g, ".")},00`
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, "");
                  e.target.value = value
                    ? `U$ ${parseInt(value)
                        .toLocaleString("en-US")
                        .replace(/,/g, ".")},00`
                    : "";
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trailerUrl">Trailer URL</Label>
            <Input
              id="trailerUrl"
              name="trailerUrl"
              type="url"
              defaultValue={movie?.trailerUrl}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                ? "Create"
                : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
