import { useState } from "react";

const genres = [
  ["28", "Action"],
  ["12", "Adventure"],
  ["16", "Animation"],
  ["35", "Comedy"],
  ["80", "Crime"],
  ["18", "Drama"],
  ["14", "Fantasy"],
  ["27", "Horror"],
  ["9648", "Mystery"],
  ["10749", "Romance"],
  ["878", "Science Fiction"],
  ["53", "Thriller"],
  ["37", "Western"],
];

const languages = [
  ["", "All Languages"],
  ["en", "English"],
  ["hi", "Hindi"],
  ["ta", "Tamil"],
  ["te", "Telugu"],
  ["ml", "Malayalam"],
  ["kn", "Kannada"],
  ["ko", "Korean"],
  ["ja", "Japanese"],
  ["es", "Spanish"],
  ["fr", "French"],
];

const audioLanguages = [
  ["", "All Audio Languages"],
  ["hi", "Hindi Audio"],
  ["en", "English Audio"],
  ["ta", "Tamil Audio"],
  ["te", "Telugu Audio"],
  ["ml", "Malayalam Audio"],
  ["kn", "Kannada Audio"],
  ["ko", "Korean Audio"],
  ["ja", "Japanese Audio"],
  ["es", "Spanish Audio"],
  ["fr", "French Audio"],
];

const industries = [
  ["", "All Industries"],
  ["hollywood", "Hollywood"],
  ["bollywood", "Bollywood"],
  ["south-indian", "South Indian"],
  ["korean", "K-Drama"],
  ["japanese", "J-Drama"],
  ["spanish", "Spanish"],
];

export default function FilterBar({
  filters,
  setFilters,
  onApply,
}) {
  const [menu, setMenu] = useState(null);

  const choose = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
    });

    setMenu(null);
  };

  const options = (key) =>
    key === "type"
      ? [
          ["all", "Movies & TV Shows"],
          ["movie", "Movies"],
          ["tv", "TV Shows"],
        ]
      : key === "popular"
        ? [
            ["popular", "Popular"],
            ["alltime", "All Time Popular"],
            ["today", "Today Popular"],
            ["month", "This Month Popular"],
            ["high", "High Rated"],
          ]
        : key === "genre"
          ? [["", "All Genres"], ...genres]
          : key === "language"
            ? languages
            : key === "audioLanguage"
              ? audioLanguages
              : key === "industry"
                ? industries
                : [];

  const years = [
    ["", "All Years"],
    ...Array.from(
      {
        length: new Date().getFullYear() - 1969,
      },
      (_, index) => {
        const value = String(
          new Date().getFullYear() - index,
        );

        return [value, value];
      },
    ),
  ];

  const label = (key) =>
    key === "year"
      ? filters.year || "All Years"
      : key === "genre"
        ? genres.find(
            (item) => item[0] === filters.genre,
          )?.[1] || "All Genres"
        : key === "language"
          ? languages.find(
              (item) =>
                item[0] === filters.language,
            )?.[1] || "All Languages"
          : key === "audioLanguage"
            ? audioLanguages.find(
                (item) =>
                  item[0] === filters.audioLanguage,
              )?.[1] || "All Audio Languages"
            : key === "industry"
              ? industries.find(
                  (item) =>
                    item[0] === filters.industry,
                )?.[1] || "All Industries"
              : key === "type"
                ? filters.type === "movie"
                  ? "Movies"
                  : filters.type === "tv"
                    ? "TV Shows"
                    : "Movies & TV Shows"
                : options(key).find(
                    (item) =>
                      item[0] === filters[key],
                  )?.[1] || "Popular";

  const filterKeys = [
    "type",
    "year",
    "popular",
    "genre",
    "language",
    "audioLanguage",
    "industry",
  ];

  return (
    <div className="rounded-2xl border border-cine-border bg-cine-panel p-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-8">
        {filterKeys.map((key) => (
          <div
            key={key}
            className="relative"
          >
            <button
              onClick={() =>
                setMenu(
                  menu === key ? null : key,
                )
              }
              className="cine-filter-control flex w-full items-center justify-between rounded-lg border border-cine-border bg-cine-input px-3 py-2 text-xs"
            >
              {label(key)}
              <span>⌄</span>
            </button>

            {menu === key && (
              <div className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-cine-border bg-cine-panel p-1 shadow-2xl">
                {(key === "year"
                  ? years
                  : options(key)
                ).map(([value, text]) => (
                  <button
                    key={value}
                    onClick={() =>
                      choose(key, value)
                    }
                    className="cine-filter-control block w-full rounded-lg px-2.5 py-2 text-left text-xs"
                  >
                    {text}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        <button
          onClick={() => onApply(filters)}
          className="rounded-lg bg-cine-gold px-4 py-2 text-xs font-black text-black"
        >
          APPLY
        </button>
      </div>
    </div>
  );
}