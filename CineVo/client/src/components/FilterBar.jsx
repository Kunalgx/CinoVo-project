import { useState } from "react";
import { getRegion, setRegion } from "../utils/region";

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
const countries = [
  ["IN", "India"],
  ["US", "United States"],
  ["GB", "United Kingdom"],
  ["CA", "Canada"],
  ["JP", "Japan"],
  ["KR", "South Korea"],
  ["FR", "France"],
  ["DE", "Germany"],
  ["AU", "Australia"],
  ["ES", "Spain"],
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
const industries = [
  ["", "All Industries"],
  ["hollywood", "Hollywood"],
  ["bollywood", "Bollywood"],
  ["south-indian", "South Indian"],
];

export default function FilterBar({ filters, setFilters, onApply }) {
  const [menu, setMenu] = useState(null);
  const choose = (key, value) => {
    setFilters({ ...filters, [key]: value });
    if (key === "region") setRegion(value);
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
            : key === "industry"
              ? industries
              : key === "region"
                ? [
                    ["US", "United States"],
                    ["IN", "India"],
                    ["GB", "United Kingdom"],
                    ["CA", "Canada"],
                    ["AU", "Australia"],
                    ["JP", "Japan"],
                    ["KR", "South Korea"],
                    ["FR", "France"],
                    ["DE", "Germany"],
                    ["ES", "Spain"],
                  ]
                : [["", "All Countries"], ...countries];
  const years = [
    ["", "All Years"],
    ...Array.from({ length: new Date().getFullYear() - 1969 }, (_, index) => {
      const value = String(new Date().getFullYear() - index);
      return [value, value];
    }),
  ];
  const label = (key) =>
    key === "year"
      ? filters.year || "All Years"
      : key === "genre"
        ? genres.find((item) => item[0] === filters.genre)?.[1] || "All Genres"
        : key === "language"
          ? languages.find((item) => item[0] === filters.language)?.[1] ||
            "All Languages"
          : key === "industry"
            ? industries.find((item) => item[0] === filters.industry)?.[1] ||
              "All Industries"
            : key === "region"
              ? options(key).find((item) => item[0] === filters.region)?.[1] ||
                "United States"
        : key === "country"
          ? countries.find((item) => item[0] === filters.country)?.[1] ||
            "All Countries"
          : key === "type"
            ? filters.type === "movie"
              ? "Movies"
              : filters.type === "tv"
                ? "TV Shows"
                : "Movies & TV Shows"
            : options(key).find((item) => item[0] === filters[key])?.[1] ||
              "Popular";

  return (
    <div className="rounded-2xl border border-cine-border bg-cine-panel p-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-8">
        {["type", "year", "popular", "genre", "language", "industry", "country", "region"].map((key) => (
          <div key={key} className="relative">
            <button
              onClick={() => setMenu(menu === key ? null : key)}
              className="flex w-full items-center justify-between rounded-lg border border-cine-border bg-[#181c25] px-3 py-2 text-xs"
            >
              {label(key)}
              <span>⌄</span>
            </button>
            {menu === key && (
              <div className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-cine-border bg-[#161a22] p-1 shadow-2xl">
                {(key === "year" ? years : options(key)).map(
                  ([value, text]) => (
                    <button
                      key={value}
                      onClick={() => choose(key, value || (key === "region" ? getRegion() : value))}
                      className="block w-full rounded-lg px-2.5 py-2 text-left text-xs hover:bg-slate-700"
                    >
                      {text}
                    </button>
                  ),
                )}
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
