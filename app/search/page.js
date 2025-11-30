import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { getStarImage } from "../stars/getStarImage";
import { getConstellationImage } from "../constellations/getConstellationImage";
import { getGalaxyImage } from "../galaxies/getGalaxyImage";
import { getPlanetImage } from "../planets/getPlanetImage";

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";

  if (!query) {
    return (
      <div className="p-10 bg-gray-900 min-h-screen text-white">
        <h1 className="text-4xl font-bold mb-8 text-center text-purple-400">
          Search
        </h1>
        <p className="text-center text-gray-400">Please enter a search query.</p>
      </div>
    );
  }

  // Fetch stars
  const { data: stars, error: starsError } = await supabase
    .from("stars")
    .select(`
      id,
      name,
      star_type,
      distance
    `)
    .ilike("name", `%${query}%`)
    .limit(6);

  // Fetch constellations
  const { data: constellations, error: constellationsError } = await supabase
    .from("constellation")
    .select(`
      id,
      name,
      abbreviation
    `)
    .ilike("name", `%${query}%`)
    .limit(6);

  // Fetch galaxies
  const { data: galaxies, error: galaxiesError } = await supabase
    .from("galaxies")
    .select(`
      galaxy_id,
      name,
      type,
      star_num
    `)
    .ilike("name", `%${query}%`)
    .limit(6);

  // Fetch planets
  const { data: planets, error: planetsError } = await supabase
    .from("planets")
    .select(`
      planet_id,
      name,
      moon_no,
      mass,
      planet_type
    `)
    .ilike("name", `%${query}%`)
    .limit(6);

  // Get all constellations for index calculation
  const { data: allConstellations } = await supabase
    .from("constellation")
    .select('id')
    .order('id');

  return (
    <div className="p-10 bg-gray-900 min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-8 text-center text-purple-400">
        Search Results for "{query}"
      </h1>

      {/* Stars Row */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-yellow-400">Stars</h2>
        {starsError ? (
          <p className="text-red-500">Error fetching stars: {starsError.message}</p>
        ) : stars && stars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stars.map((star) => (
              <Link key={star.id} href={`/stars/${star.id}`}>
                <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:shadow-yellow-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                  <div className="h-48 relative overflow-hidden">
                    <Image
                      src={getStarImage(star.star_type)}
                      alt={star.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-2xl font-bold mb-2">{star.name}</h3>
                    <p className="text-gray-400">
                      <span className="text-gray-500">Type:</span> {star.star_type || 'N/A'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No stars found matching "{query}"</p>
        )}
      </div>

      {/* Constellations Row */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-pink-400">Constellations</h2>
        {constellationsError ? (
          <p className="text-red-500">Error fetching constellations: {constellationsError.message}</p>
        ) : constellations && constellations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {constellations.map((constellation, index) => {
              const constellationIndex = allConstellations?.findIndex(c => c.id === constellation.id) ?? index;
              return (
                <Link key={constellation.id} href={`/constellations/${constellation.id}`}>
                  <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:shadow-purple-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                    <div className="h-48 relative overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-800">
                      <Image
                        src={getConstellationImage(constellationIndex)}
                        alt={constellation.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent flex items-end p-4">
                        <span className="text-white font-semibold text-lg">{constellation.name}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-2xl font-bold mb-2">{constellation.name}</h3>
                      {constellation.abbreviation && (
                        <p className="text-gray-400">
                          <span className="text-gray-500">Abbreviation:</span> {constellation.abbreviation}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400">No constellations found matching "{query}"</p>
        )}
      </div>

      {/* Galaxies Row */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-purple-400">Galaxies</h2>
        {galaxiesError ? (
          <p className="text-red-500">Error fetching galaxies: {galaxiesError.message}</p>
        ) : galaxies && galaxies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galaxies.map((galaxy) => (
              <Link key={galaxy.galaxy_id} href={`/galaxies/${galaxy.galaxy_id}`}>
                <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:shadow-purple-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                  <div className="h-48 relative overflow-hidden">
                    <Image
                      src={getGalaxyImage(galaxy.type)}
                      alt={galaxy.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-2xl font-bold mb-2">{galaxy.name}</h3>
                    <p className="text-gray-400">
                      <span className="text-gray-500">Type:</span> {galaxy.type || 'N/A'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No galaxies found matching "{query}"</p>
        )}
      </div>

      {/* Planets Row */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-blue-400">Planets</h2>
        {planetsError ? (
          <p className="text-red-500">Error fetching planets: {planetsError.message}</p>
        ) : planets && planets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planets.map((planet) => (
              <Link key={planet.planet_id} href={`/planets/${planet.planet_id}`}>
                <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:shadow-blue-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                  <div className="h-48 relative overflow-hidden">
                    <Image
                      src={getPlanetImage(planet.planet_type)}
                      alt={planet.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-2xl font-bold mb-2">{planet.name}</h3>
                    <p className="text-gray-400">
                      <span className="text-gray-500">Type:</span> {planet.planet_type && planet.planet_id != "Placeholder Object" ? `${planet.planet_type}` : 'No type assigned'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No planets found matching "{query}"</p>
        )}
      </div>
    </div>
  );
}

