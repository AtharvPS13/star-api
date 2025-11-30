import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default async function PlanetsPage() {
  const { data: planets, error } = await supabase
    .from("planets")
    .select(`
      planet_id,
      name,
      moon_no,
      mass,
      surface_temp,
      radius,
      age,
      galaxy_id,
      galaxies (
        galaxy_id,
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
          Planets
        </h1>
        <Link href="/">
          <button className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition">
            Home
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planets?.map((planet) => (
          <div
            key={planet.planet_id}
            className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:shadow-blue-500/50 hover:shadow-lg transition-all duration-300"
          >
            <div className="h-48 bg-gradient-to-br from-blue-900 to-cyan-800 flex items-center justify-center">
              <span className="text-gray-400 italic">
                Image of {planet.name}
              </span>
            </div>

            <div className="p-5">
              <h2 className="text-2xl font-bold mb-2">{planet.name}</h2>
              
              <div className="space-y-2 text-sm mb-4">
                <p><span className="text-gray-500">Mass:</span> {planet.mass ? `${planet.mass} kg` : 'N/A'}</p>
                <p><span className="text-gray-500">Radius:</span> {planet.radius ? `${planet.radius} km` : 'N/A'}</p>
                <p><span className="text-gray-500">Moons:</span> {planet.moon_no || 0}</p>
                <p><span className="text-gray-500">Surface Temp:</span> {planet.surface_temp ? `${planet.surface_temp} K` : 'N/A'}</p>
                <p><span className="text-gray-500">Age:</span> {planet.age ? `${planet.age} years` : 'N/A'}</p>
              </div>

              {/* Galaxy Link */}
              {planet.galaxies && (
                <div className="mt-4">
                  <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-2">
                    Galaxy:
                  </h3>
                  <Link href={`/galaxies?galaxy_id=${planet.galaxies.galaxy_id}`}>
                    <span className="px-3 py-1 bg-indigo-900/50 text-indigo-200 text-sm rounded-full border border-indigo-700 hover:bg-indigo-800 cursor-pointer transition inline-block">
                      {planet.galaxies.name}
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

