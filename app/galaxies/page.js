import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default async function GalaxiesPage() {
  const { data: galaxies, error } = await supabase
    .from("galaxies")
    .select(`
      galaxy_id,
      name,
      distance,
      mass,
      diameter,
      star_num,
      type,
      age,
      stars (
        id,
        name
      ),
      planets (
        planet_id,
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
          Galaxies
        </h1>
        <Link href="/">
          <button className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition">
            Home
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galaxies?.map((galaxy) => (
          <div
            key={galaxy.galaxy_id}
            className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:shadow-purple-500/50 hover:shadow-lg transition-all duration-300"
          >
            <div className="h-48 bg-gradient-to-br from-indigo-900 to-purple-800 flex items-center justify-center">
              <span className="text-gray-400 italic">
                Image of {galaxy.name}
              </span>
            </div>

            <div className="p-5">
              <h2 className="text-2xl font-bold mb-2">{galaxy.name}</h2>
              
              <div className="space-y-2 text-sm mb-4">
                <p><span className="text-gray-500">Type:</span> {galaxy.type}</p>
                <p><span className="text-gray-500">Distance:</span> {galaxy.distance ? `${galaxy.distance} light years` : 'N/A'}</p>
                <p><span className="text-gray-500">Stars:</span> {galaxy.star_num || 0}</p>
              </div>

              {/* Stars List */}
              <div className="mt-4">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-2">
                  Stars:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {galaxy.stars && galaxy.stars.length > 0 ? (
                    galaxy.stars.map((star) => (
                      <Link key={star.id} href={`/stars?id=${star.id}`}>
                        <span className="px-2 py-1 bg-purple-900/50 text-purple-200 text-xs rounded-full border border-purple-700 hover:bg-purple-800 cursor-pointer transition">
                          {star.name}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <span className="text-gray-600 text-sm">
                      No stars recorded yet.
                    </span>
                  )}
                </div>
              </div>

              {/* Planets List */}
              <div className="mt-4">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-2">
                  Planets:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {galaxy.planets && galaxy.planets.length > 0 ? (
                    galaxy.planets.map((planet) => (
                      <Link key={planet.planet_id} href={`/planets?id=${planet.planet_id}`}>
                        <span className="px-2 py-1 bg-blue-900/50 text-blue-200 text-xs rounded-full border border-blue-700 hover:bg-blue-800 cursor-pointer transition">
                          {planet.name}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <span className="text-gray-600 text-sm">
                      No planets recorded yet.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

