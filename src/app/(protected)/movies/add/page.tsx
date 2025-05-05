// src/app/(protected)/movies/add/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { movieService } from "@/lib/api";
import { movieSchema } from "@/lib/validation";
import { toast } from "react-hot-toast";
import { ArrowLeft, Upload } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MovieFormValues = z.infer<typeof movieSchema>;

export default function AddMoviePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  const form = useForm<MovieFormValues>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: "",
      originalTitle: "",
      releaseDate: "",
      overview: "",
      budget: undefined,
      runtime: undefined,
      score: undefined,
    },
  });

  const handlePosterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("poster", file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPosterPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: MovieFormValues) => {
    try {
      setIsSubmitting(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("title", data.title);
      if (data.originalTitle)
        formData.append("originalTitle", data.originalTitle);
      formData.append("releaseDate", data.releaseDate);
      formData.append("overview", data.overview);
      if (data.budget) formData.append("budget", data.budget.toString());
      if (data.runtime) formData.append("runtime", data.runtime.toString());
      if (data.score) formData.append("score", data.score.toString());
      if (data.poster) formData.append("poster", data.poster);

      await movieService.create(formData);
      toast.success("Movie added successfully");
      router.push("/movies");
    } catch (error) {
      console.error("Error adding movie:", error);
      toast.error("Failed to add movie");
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <Card>
        <CardHeader>
          <CardTitle>Add New Movie</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Movie title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="originalTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Original title (if different)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="releaseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Release Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="runtime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Runtime (min)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="120"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? Number(e.target.value) : ""
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1000000"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? Number(e.target.value) : ""
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="score"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Score (0-10)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              placeholder="7.5"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? Number(e.target.value) : ""
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="overview"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overview *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Movie description..."
                            className="min-h-32 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="poster"
                    render={() => (
                      <FormItem>
                        <FormLabel>Movie Poster</FormLabel>
                        <FormControl>
                          <div className="flex flex-col items-center justify-center gap-4">
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 w-full aspect-[2/3] flex flex-col items-center justify-center relative overflow-hidden">
                              {posterPreview ? (
                                <div className="relative w-full h-full">
                                  <Image
                                    src={posterPreview}
                                    alt="Poster preview"
                                    fill
                                    className="object-cover"
                                    unoptimized={true} // Required for local file URLs
                                  />
                                </div>
                              ) : (
                                <>
                                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                  <p className="text-sm text-muted-foreground text-center">
                                    Drag and drop or click to upload your movie
                                    poster
                                  </p>
                                </>
                              )}
                            </div>
                            <Input
                              type="file"
                              id="poster"
                              accept="image/*"
                              onChange={handlePosterChange}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                document.getElementById("poster")?.click()
                              }
                            >
                              {posterPreview
                                ? "Change Poster"
                                : "Select Poster"}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/movies")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Movie"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
