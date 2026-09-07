import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import TrendingSection from "../components/TrendingSection";
import FilterBar from "../components/FilterBar";
import MovieGrid from "../components/MovieGrid";
import Pagination from "../components/Pagination";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

import { movieService } from "../services/movieService";
import { userService } from "../services/userService";
import { useAuth } from "../context/AuthContext";

import Modal from "../components/Modal";
import DatePicker from "../components/DatePicker";

const today = () =>
  new Date().toISOString().slice(0, 10);

const INDUSTRY_LANGUAGES = {
  hollywood: ["en"],
  bollywood: ["hi"],
  "south-indian": ["ta", "te", "ml", "kn"],
  korean: ["ko"],
  japanese: ["ja"],
  spanish: ["es"],
};

export default function Home() {
  const nav = useNavigate();
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    type: "all",
    year: "",
    popular: "popular",
    genre: "",
    language: "",
    audioLanguage: "",
    industry: "",
  });

  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [watched, setWatched] = useState([]);
  const [scheduled, setScheduled] = useState([]);

  const [dateModal, setDateModal] = useState(null);

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const load = async (
    nextFilters = filters,
    nextPage = page,
  ) => {
    setLoading(true);
    setError("");

    try {
      /*
       * LIVE AUDIO SEARCH
       *
       * Uses Streaming Availability API.
       * Audio languages are real dubbed audio data.
       */
      if (nextFilters.audioLanguage) {
        const selectedIndustryLanguages =
          nextFilters.industry &&
          INDUSTRY_LANGUAGES[nextFilters.industry]
            ? INDUSTRY_LANGUAGES[
                nextFilters.industry
              ]
            : [""];

        const requestedLanguages =
          nextFilters.language
            ? [nextFilters.language]
            : selectedIndustryLanguages;

        const types =
          nextFilters.type === "movie" ||
          nextFilters.type === "tv"
            ? [nextFilters.type]
            : ["movie", "tv"];

        let all = [];

        for (const type of types) {
          for (const originalLanguage of requestedLanguages) {
            let cursor = null;
            let pageCount = 0;

            /*
             * Fetch multiple API pages so the result
             * is not biased toward the first 20 titles.
             */
            while (pageCount < 5) {
              const response =
                await movieService.searchAudio({
                  country: "in",

                  audio:
                    nextFilters.audioLanguage,

                  show_type:
                    type === "tv"
                      ? "series"
                      : "movie",

                  ...(originalLanguage
                    ? {
                        show_original_language:
                          originalLanguage,
                      }
                    : {}),

                  ...(nextFilters.genre
                    ? {
                        genres:
                          nextFilters.genre,
                      }
                    : {}),

                  ...(nextFilters.year
                    ? {
                        year:
                          nextFilters.year,
                      }
                    : {}),

                  ...(cursor
                    ? {
                        cursor,
                      }
                    : {}),
                });

              const data =
                response?.data?.data || {};

              const shows =
                data.shows || [];

              for (const show of shows) {
                const tmdbId =
                  String(
                    show.tmdbId || "",
                  );

                const [mediaType, id] =
                  tmdbId.split("/");

                if (
                  !id ||
                  !["movie", "tv"].includes(
                    mediaType,
                  )
                ) {
                  continue;
                }

                /*
                 * Check actual audio returned
                 * by Streaming Availability API.
                 */
                const options =
                  show.streamingOptions?.in ||
                  [];

                const hasAudio =
                  options.some((option) =>
                    (option.audios || []).some(
                      (audio) =>
                        String(
                          audio.language,
                        ).toLowerCase() ===
                        getAudioApiCode(
                          nextFilters.audioLanguage,
                        ),
                    ),
                  );

                if (!hasAudio) continue;

                all.push({
                  ...show,
                  id: Number(id),
                  media_type: mediaType,
                  audio_verified: true,
                });
              }

              pageCount += 1;

              const nextCursor =
                data.nextCursor || null;

              if (
                !data.hasMore ||
                !nextCursor
              ) {
                break;
              }

              cursor = nextCursor;
            }
          }
        }

        /*
         * Remove duplicate movie/TV results.
         */
        const unique = new Map();

        for (const item of all) {
          unique.set(
            `${item.media_type}:${item.id}`,
            item,
          );
        }

        /*
         * Enrich results with TMDB details.
         */
        const enriched =
          await Promise.all(
            [...unique.values()].map(
              async (item) => {
                try {
                  const response =
                    await movieService.details(
                      item.media_type,
                      item.id,
                    );

                  const details =
                    response?.[0]?.data?.data ||
                    {};

                  return {
                    ...details,

                    id: item.id,

                    media_type:
                      item.media_type,

                    audio_verified: true,

                    audio_languages:
                      getAudioLanguages(
                        item,
                      ),

                    poster_path:
                      details.poster_path ||
                      item.posterPath ||
                      null,

                    backdrop_path:
                      details.backdrop_path ||
                      item.backdropPath ||
                      null,
                  };
                } catch {
                  return {
                    ...item,
                    id: item.id,
                    media_type:
                      item.media_type,
                    audio_verified: true,
                  };
                }
              },
            ),
          );

        /*
         * Apply final client-side filters.
         */
        let finalResults =
          enriched.filter(Boolean);

        if (nextFilters.year) {
          finalResults =
            finalResults.filter(
              (item) =>
                String(
                  item.release_date ||
                    item.first_air_date ||
                    "",
                ).startsWith(
                  String(nextFilters.year),
                ),
            );
        }

        if (nextFilters.genre) {
          finalResults =
            finalResults.filter((item) =>
              (item.genre_ids || []).some(
                (id) =>
                  String(id) ===
                  String(
                    nextFilters.genre,
                  ),
              ),
            );
        }

        if (nextFilters.popular === "high") {
          finalResults.sort(
            (a, b) =>
              Number(b.vote_average || 0) -
              Number(a.vote_average || 0),
          );
        } else {
          finalResults.sort(
            (a, b) =>
              Number(b.popularity || 0) -
              Number(a.popularity || 0),
          );
        }

        /*
         * Keep pagination UI working.
         * Audio search fetches a larger candidate pool.
         */
        const start =
          (nextPage - 1) * 20;

        const end = start + 20;

        setItems(
          finalResults.slice(
            start,
            end,
          ),
        );

        return;
      }

      /*
       * NORMAL TMDB SEARCH
       *
       * Used when no Audio Language is selected.
       */
      const discoverFilters = {
        type: nextFilters.type,
        year: nextFilters.year,
        popular: nextFilters.popular,
        genre: nextFilters.genre,
        language: nextFilters.language,
        industry: nextFilters.industry,
        page: nextPage,
      };

      const response =
        await movieService.discover(
          discoverFilters,
        );

      setItems(
        response?.data?.data?.results ||
          [],
      );
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Unable to load results.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  useEffect(() => {
    if (user) {
      Promise.all([
        userService.watched(),
        userService.scheduled(),
      ])
        .then(([watchedResponse, scheduledResponse]) => {
          setWatched(
            watchedResponse.data.items,
          );

          setScheduled(
            scheduledResponse.data.items,
          );
        })
        .catch(() => {});
    } else {
      setWatched([]);
      setScheduled([]);
    }
  }, [user]);

  const isW = (x, type) =>
    watched.some(
      (v) =>
        v.tmdbId === x.id &&
        v.mediaType === type,
    );

  const isS = (x, type) =>
    scheduled.some(
      (v) =>
        v.tmdbId === x.id &&
        v.mediaType === type,
    );

  const save = async (
    action,
    x,
    type,
  ) => {
    if (!user) {
      nav("/login");
      return;
    }

    const alreadySaved =
      action === "watched"
        ? isW(x, type)
        : isS(x, type);

    if (alreadySaved) {
      try {
        if (action === "watched") {
          await userService.removeWatched(
            type,
            x.id,
          );

          setWatched(
            (
              await userService.watched()
            ).data.items,
          );
        } else {
          await userService.removeScheduled(
            type,
            x.id,
          );

          setScheduled(
            (
              await userService.scheduled()
            ).data.items,
          );
        }
      } catch (removeError) {
        setError(
          removeError.response?.data
            ?.message ||
            "Could not update this title.",
        );
      }

      return;
    }

    setDateModal({
      action,
      x,
      type,
    });
  };

  const confirm = async () => {
    if (!dateModal) return;

    const {
      x,
      type,
      action,
    } = dateModal;

    const data = {
      tmdbId: x.id,

      mediaType: type,

      title:
        type === "tv"
          ? x.name
          : x.title,

      posterPath:
        x.poster_path,

      date,
    };

    try {
      if (action === "watched") {
        await userService.addWatched(
          data,
        );

        setWatched(
          (
            await userService.watched()
          ).data.items,
        );
      } else {
        await userService.addScheduled(
          data,
        );

        setScheduled(
          (
            await userService.scheduled()
          ).data.items,
        );
      }

      setDateModal(null);
    } catch (e) {
      alert(
        e.response?.data?.message ||
          "Could not save",
      );
    }
  };

  return (
    <main className="mx-auto max-w-[1450px] space-y-8 px-3 py-6 sm:px-5 sm:py-7">
      <section>
        <h2 className="mb-1 text-xl font-extrabold">
          Trending Recommendations
        </h2>

        <p className="mb-4 text-sm text-cine-muted">
          Movies & TV Shows
        </p>

        <TrendingSection
          onDetails={(id, type) =>
            nav(`/${type}/${id}`)
          }
        />
      </section>

      <section>
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          onApply={(nextFilters) => {
            setFilters(nextFilters);

            if (page === 1) {
              load(nextFilters, 1);
              return;
            }

            setPage(1);
          }}
        />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-extrabold">
            {filters.type === "movie"
              ? "Movies"
              : filters.type === "tv"
                ? "TV Shows"
                : "Movies & TV Shows"}
          </h2>

          <p className="text-xs text-cine-muted">
            {items.length} unique results
          </p>
        </div>

        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorMessage
            message={error}
            retry={load}
          />
        ) : items.length ? (
          <>
            <MovieGrid
              items={items}
              onDetails={(id, type) =>
                nav(`/${type}/${id}`)
              }
              watched={isW}
              scheduled={isS}
              onWatched={(x, type) =>
                save(
                  "watched",
                  x,
                  type,
                )
              }
              onScheduled={(x, type) =>
                save(
                  "scheduled",
                  x,
                  type,
                )
              }
            />

            <Pagination
              page={page}
              onChange={setPage}
            />
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-cine-border p-10 text-center text-cine-muted">
            No results found.
          </div>
        )}
      </section>

      <Modal
        open={!!dateModal}
        onClose={() =>
          setDateModal(null)
        }
        title={
          dateModal?.action ===
          "watched"
            ? "When did you watch it?"
            : "When will you watch it?"
        }
      >
        <DatePicker
          value={date}
          onChange={setDate}
          minDate={
            dateModal?.action ===
            "scheduled"
              ? today()
              : undefined
          }
          maxDate={
            dateModal?.action ===
            "watched"
              ? today()
              : undefined
          }
        />

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={() =>
              setDateModal(null)
            }
            className="rounded-xl border border-cine-border bg-white/[0.03] py-3 text-sm font-black text-slate-300 transition hover:bg-white/[0.08]"
          >
            Cancel
          </button>

          <button
            onClick={confirm}
            className="rounded-xl bg-cine-gold py-3 text-sm font-black text-black transition hover:brightness-110"
          >
            Save
          </button>
        </div>
      </Modal>
    </main>
  );
}

/*
 * Convert frontend audio code to
 * Streaming Availability API audio code.
 */
function getAudioApiCode(
  language,
) {
  const map = {
    hi: "hin",
    en: "eng",
    ta: "tam",
    te: "tel",
    ml: "mal",
    kn: "kan",
    ko: "kor",
    ja: "jpn",
    es: "spa",
    fr: "fra",
  };

  return (
    map[language] ||
    language
  );
}

/*
 * Extract actual audio languages
 * returned by the live API .
 * Streaming Availability API Documentation
 */
function getAudioLanguages(
  show,
) {
  const options =
    show.streamingOptions?.in ||
    [];

  const languages = new Set();

  for (const option of options) {
    for (const audio of option.audios ||
      []) {
      if (audio.language) {
        languages.add(
          String(
            audio.language,
          ).toLowerCase(),
        );
      }
    }
  }

  return [...languages];
}