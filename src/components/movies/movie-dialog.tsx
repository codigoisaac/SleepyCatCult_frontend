"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { movieService } from "@/lib/api";
import { Movie, MovieForm } from "@/types/movie";
import { useState } from "react";
import { CoverInput } from "./MovieCoverInput";

interface MovieDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movie?: Movie;
  setMovie?: (movie: Movie) => void;
  mode: "create" | "edit";
}

export function MovieDialog({
  open,
  onOpenChange,
  movie,
  setMovie,
  mode,
}: MovieDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budget, setBudget] = useState(movie?.budget?.toString() || "");
  const [revenue, setRevenue] = useState(movie?.revenue?.toString() || "");
  const [profit, setProfit] = useState(movie?.profit?.toString() || "");
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const handleMoneyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void,
  ) => {
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    setter(rawValue);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);

      if (coverFile) {
        //! formData.append("cover", coverFile);
      }

      const data: MovieForm = {
        title: formData.get("title")?.toString() || "",
        originalTitle: formData.get("originalTitle")?.toString() || "",
        popularity: Number(formData.get("popularity")),
        voteCount: Number(formData.get("voteCount")),
        budget: Number(formData.get("budget")),
        revenue: Number(formData.get("revenue")),
        profit: Number(formData.get("profit")),
        score: Number(formData.get("score")),
        tagline: formData.get("tagline")?.toString() || "",
        synopsis: formData.get("synopsis")?.toString() || "",
        genres: (formData.get("genres")?.toString() || "")
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean),
        releaseDate: formData.get("releaseDate")?.toString() || "",
        duration: Number(formData.get("duration")),
        status: formData.get("status")?.toString() || "",
        language: formData.get("language")?.toString() || "",
        trailerUrl: formData.get("trailerUrl")?.toString() || "",
      };

      if (mode === "create") {
        await movieService.create(data);
        //! await movieService.create(data, coverFile);
      } else {
        const updatedMovie = await movieService.update(movie!.id, data);
        //! const updatedMovie = await movieService.update(movie!.id, data, coverFile);
        setMovie?.(updatedMovie.data);
      }

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
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <CoverInput
                defaultValue={movie?.coverImageUrl}
                onChange={setCoverFile}
                required={mode === "create"}
              />
            </div>

            <div className="col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>

                  <Input
                    id="title"
                    name="title"
                    defaultValue={movie?.title}
                    required={mode === "create"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalTitle">Original Title</Label>

                  <Input
                    id="originalTitle"
                    name="originalTitle"
                    defaultValue={movie?.originalTitle}
                    required={mode === "create"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>

                <Input
                  id="tagline"
                  name="tagline"
                  defaultValue={movie?.tagline}
                  required={mode === "create"}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genres">Genres (comma-separated)</Label>

            <Input
              id="genres"
              name="genres"
              defaultValue={movie?.genres.join(", ")}
              required={mode === "create"}
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
              required={mode === "create"}
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
                required={mode === "create"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="voteCount">Vote Count</Label>

              <Input
                type="text"
                id="voteCount"
                name="voteCount"
                defaultValue={movie?.voteCount}
                required={mode === "create"}
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
                step="1"
                required={mode === "create"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="releaseDate">Release Date</Label>

              <Input
                type="date"
                id="releaseDate"
                name="releaseDate"
                defaultValue={movie?.releaseDate?.split("T")[0]}
                required={mode === "create"}
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
                required={mode === "create"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>

              <Input
                id="status"
                name="status"
                defaultValue={movie?.status}
                required={mode === "create"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>

              <Input
                id="language"
                name="language"
                defaultValue={movie?.language}
                required={mode === "create"}
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
                onChange={(e) => handleMoneyChange(e, setBudget)}
                maxLength={15}
                defaultValue={movie?.budget}
                required={mode === "create"}
              />

              <p className="text-sm text-muted-foreground">
                {formatMoneyDisplay(budget)}
              </p>

              <p className="text-sm text-muted-foreground">
                {formatMoneyToWords(Number(budget || 0))}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenue">Revenue</Label>

              <Input
                type="text"
                id="revenue"
                name="revenue"
                onChange={(e) => handleMoneyChange(e, setRevenue)}
                maxLength={15}
                defaultValue={movie?.revenue}
                required={mode === "create"}
              />

              <p className="text-sm text-muted-foreground">
                {formatMoneyDisplay(revenue)}
              </p>

              <p className="text-sm text-muted-foreground">
                {formatMoneyToWords(Number(revenue || 0))}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profit">Profit</Label>

              <Input
                type="text"
                id="profit"
                name="profit"
                onChange={(e) => handleMoneyChange(e, setProfit)}
                maxLength={15}
                defaultValue={movie?.profit}
                required={mode === "create"}
              />

              <p className="text-sm text-muted-foreground">
                {formatMoneyDisplay(profit)}
              </p>

              <p className="text-sm text-muted-foreground">
                {formatMoneyToWords(Number(profit || 0))}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trailerUrl">Trailer URL</Label>

            <Input
              id="trailerUrl"
              name="trailerUrl"
              type="url"
              defaultValue={movie?.trailerUrl}
              required={mode === "create"}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer"
            >
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

const formatMoneyDisplay = (value: string) => {
  if (!value) return "";
  const numericValue = parseInt(value);
  return `U$ ${numericValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

function formatMoneyToWords(amount: number): string {
  if (!amount) return "";

  const billion = 1000000000;
  const million = 1000000;
  const thousand = 1000;

  if (amount >= billion) {
    const billions = Math.floor(amount / billion);
    return `${billions} billion + dollars`;
  } else if (amount >= million) {
    const millions = Math.floor(amount / million);
    return `${millions} million + dollars`;
  } else if (amount >= thousand) {
    const thousands = Math.floor(amount / thousand);
    return `${thousands} thousand + dollars`;
  }

  return `${amount} dollars`;
}
