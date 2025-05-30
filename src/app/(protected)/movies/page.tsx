"use client";

import { MovieCard } from "@/components/movies/movie-card";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { movieService } from "@/lib/api";
import { filterSchema } from "@/lib/validation";
import { Movie } from "@/types/movie";
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type FilterFormValues = z.infer<typeof filterSchema>;

export default function MoviesPage() {
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

        const moviesData = response.data.movies;

        if (Array.isArray(moviesData)) {
          setMovies(moviesData);

          // If totalPages is provided, use it, otherwise calculate
          if (response.data.totalPages) {
            setTotalPages(response.data.totalPages);
          } else {
            // Assuming 12 per page if not provided
            const total = Array.isArray(response.data)
              ? response.data.length
              : 0;
            setTotalPages(Math.ceil(total / 12));
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
    <>
      {/* Search and filter */}
      <div className="flex justify-between items-center mb-6">
        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-sm items-center space-x-2"
        >
          <Input
            type="search"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" size="icon" className="cursor-pointer">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {/* Filter and Add */}
        <div className="flex gap-2">
          <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="cursor-pointer">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DialogTrigger>

            {/* Filter dialog */}
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
                                  e.target.value ? Number(e.target.value) : "",
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
                                  e.target.value ? Number(e.target.value) : "",
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
                                  e.target.value ? Number(e.target.value) : "",
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
                                  e.target.value ? Number(e.target.value) : "",
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

          <Button
            onClick={() => router.push("/movies/add")}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Movie
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="h-[350px] rounded-lg bg-muted animate-pulse"
            ></div>
          ))}
        </div>
      ) : movies?.length > 0 ? (
        <>
          {/* Movies list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={() => router.push(`/movies/${movie.id}`)}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      ) : (
        // When there are no movies
        <div className="text-center py-16">
          <h2 className="text-2xl font-medium">No movies found</h2>

          <p className="text-muted-foreground mt-2">
            {`Wait, the cult can't be empty. Add a movie to get started!`}
          </p>
        </div>
      )}
    </>
  );
}
