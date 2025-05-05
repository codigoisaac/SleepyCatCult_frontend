"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { movieService } from "@/lib/api";
import { filterSchema } from "@/lib/validation";
import { Search, Filter, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MovieCard } from "@/components/movies/movie-card";
import { Pagination } from "@/components/ui/pagination";
import { UserNav } from "@/components/layout/user-nav";
import { z } from "zod";

// Update the Movie type to match the API response
type Movie = {
  id: number;
  title: string;
  originalTitle: string;
  releaseDate: string;
  synopsis: string;
  coverImage: string;
  budget: number;
  duration: number;
  score: number;
  userId: number;
  popularity: number;
  voteCount: number;
  tagline: string;
  genres: string[];
  status: string;
  language: string;
  revenue: number;
  profit: number;
  trailerUrl: string;
  createdAt: string;
  updatedAt: string;
};

type FilterFormValues = z.infer<typeof filterSchema>;

export default function MoviesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterFormValues>({});

  const filterForm = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      durationMin: null,
      durationMax: null,
      releaseDateMin: "",
      releaseDateMax: "",
      scoreMin: null,
      scoreMax: null,
    },
  });

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await movieService.getAll({
          paginationPage: currentPage,
          search: searchQuery,
          ...activeFilters,
        });

        // Check if response.data contains movies directly or nested
        // Handle both cases: response.data.movies or response.data as the array
        const moviesData = Array.isArray(response.data)
          ? response.data
          : response.data.movies;

        if (Array.isArray(moviesData)) {
          setMovies(moviesData);

          // If totalPages is provided, use it, otherwise calculate
          if (response.data.totalPages) {
            setTotalPages(response.data.totalPages);
          } else {
            // Assuming 10 per page if not provided
            const total = Array.isArray(response.data)
              ? response.data.length
              : 0;
            setTotalPages(Math.ceil(total / 10));
          }
        } else {
          console.error("Unexpected response format:", response.data);
          setMovies([]);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [currentPage, searchQuery, activeFilters]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const applyFilters = (data: FilterFormValues) => {
    setActiveFilters(data);
    setCurrentPage(1);
    setFilterOpen(false);
  };

  const resetFilters = () => {
    filterForm.reset();
    setActiveFilters({});
    setCurrentPage(1);
    setFilterOpen(false);
  };

  return (
    <div className="container mx-auto py-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Cubos Movies</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user && <UserNav user={user} />}
        </div>
      </header>

      <div className="flex justify-between items-center mb-6">
        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-sm items-center space-x-2"
        >
          <Input
            type="search"
            placeholder="Procurar filmes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {/* Filter button */}
        <div className="flex gap-2">
          <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </DialogTrigger>

            {/* Dialog content */}
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Filtrar filmes</DialogTitle>
              </DialogHeader>
              <Form {...filterForm}>
                <form
                  onSubmit={filterForm.handleSubmit(applyFilters)}
                  className="space-y-4"
                >
                  {/* Score */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={filterForm.control}
                      name="scoreMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nota mínima</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              placeholder="0"
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
                      control={filterForm.control}
                      name="scoreMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nota máxima</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              placeholder="10"
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

                  {/* Release date */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={filterForm.control}
                      name="releaseDateMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de lançamento mínima</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={filterForm.control}
                      name="releaseDateMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de lançamento máxima</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={filterForm.control}
                      name="durationMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duração mínima (em minutos)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
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
                      control={filterForm.control}
                      name="durationMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duração máxima (em minutos)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="300"
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

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetFilters}
                    >
                      Resetar filtros
                    </Button>
                    <Button type="submit">Aplicar filtros</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Button onClick={() => router.push("/movies/add")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Movie
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="h-[350px] rounded-lg bg-muted animate-pulse"
            ></div>
          ))}
        </div>
      ) : movies?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={() => router.push(`/movies/${movie.id}`)}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-medium">No movies found</h2>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search or filters to find what you&apos;re
            looking for.
          </p>
        </div>
      )}
    </div>
  );
}
