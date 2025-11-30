import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default async function StarsPage() {
  const { data: stars, error } = await supabase
    .from("stars")
    .select(`
      id,
      name,
      distance,
      mass,
      spectral_type,
      discovered,
      temperature,
      luminosity,
      age,
      star_type,
      galaxy_id,
      constellation_id,
      galaxies (
        galaxy_id,
        name
      ),
      constellation (
        id,
        name
      )
    `);

  if (error) {
    return (
      <div className="text-red-500">Error fetching data: {error.message}</div>
    );
  }

  return (
    <div className="p-10 bg-gray-900 min-h-screen text-white">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-center text-purple-400">
          Stars
        </h1>
        <Link href="/">
          <button className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition">
            Home
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stars?.map((star) => (
          <div
            key={star.id}
            className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:shadow-purple-500/50 hover:shadow-lg transition-all duration-300"
          >
            <div className="h-48 bg-gradient-to-br from-yellow-900 to-orange-800 flex items-center justify-center">
              <span className="text-gray-400 italic">
                Image of {star.name}
              </span>
            </div>

            <div className="p-5">
              <h2 className="text-2xl font-bold mb-2">{star.name}</h2>
              
              <div className="space-y-2 text-sm mb-4">
                <p><span className="text-gray-500">Type:</span> {star.star_type || 'N/A'}</p>
                <p><span className="text-gray-500">Spectral Type:</span> {star.spectral_type || 'N/A'}</p>
                <p><span className="text-gray-500">Distance:</span> {star.distance ? `${star.distance} light years` : 'N/A'}</p>
                <p><span className="text-gray-500">Temperature:</span> {star.temperature ? `${star.temperature} K` : 'N/A'}</p>
              </div>

              {/* Galaxy Link */}
              {star.galaxies && (
                <div className="mt-4">
                  <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-2">
                    Galaxy:
                  </h3>
                  <Link href={`/galaxies?galaxy_id=${star.galaxies.galaxy_id}`}>
                    <span className="px-3 py-1 bg-indigo-900/50 text-indigo-200 text-sm rounded-full border border-indigo-700 hover:bg-indigo-800 cursor-pointer transition inline-block">
                      {star.galaxies.name}
                    </span>
                  </Link>
                </div>
              )}

              {/* Constellation Link */}
              {star.constellation && (
                <div className="mt-4">
                  <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-2">
                    Constellation:
                  </h3>
                  <Link href={`/constellations?constellation_id=${star.constellation.id}`}>
                    <span className="px-3 py-1 bg-purple-900/50 text-purple-200 text-sm rounded-full border border-purple-700 hover:bg-purple-800 cursor-pointer transition inline-block">
                      {star.constellation.name}
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

