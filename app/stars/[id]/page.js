import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { notFound } from "next/navigation";
import StarSystemSimulation from "@/components/StarSystemSimulation";
import { formatNumber } from "@/lib/formatNumber";

export default async function StarDetailPage({ params }) {
  const { id } = await params;

  const { data: star, error } = await supabase
    .from("stars")
    .select(
      `
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
      planets (
        planet_id,
        name
      ),
      constellation (
        id,
        name
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !star) {
    notFound();
  }

  return (
    <div className="p-10 bg-gray-900 min-h-screen text-white">
      <nav className="text-sm text-gray-400 mb-8 flex items-center space-x-2">
        <Link href="/" className="hover:text-yellow-400 transition">
          Universe
        </Link>
        <span>&gt;</span>
        {star.galaxies ? (
          <Link
            href={`/galaxies/${star.galaxies.galaxy_id}`}
            className="hover:text-yellow-400 transition"
          >
            Galaxy: {star.galaxies.name}
          </Link>
        ) : (
          <span>Unknown Galaxy</span>
        )}
        <span>&gt;</span>
        <span className="text-yellow-300 font-medium">Star: {star.name}</span>
      </nav>

      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="h-[500px] relative w-full border-b border-gray-700">
            <StarSystemSimulation starData={star} />

            <div className="absolute top-0 left-0 p-6 pointer-events-none">
              <h1 className="text-4xl font-bold text-white drop-shadow-md">
                {star.name}
              </h1>
              <p className="text-blue-200 text-sm">{star.star_type} System</p>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">
                    Star Type
                  </span>
                  <p className="text-xl">{star.star_type || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">
                    Spectral Type
                  </span>
                  <p className="text-xl">{star.spectral_type || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">
                    Distance
                  </span>
                  <p className="text-xl">
                    {star.distance ? `${formatNumber(star.distance)} light years` : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">
                    Mass
                  </span>
                  <p className="text-xl">
                    {star.mass ? `${formatNumber(star.mass)} solar mass` : "N/A"}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">
                    Temperature
                  </span>
                  <p className="text-xl">
                    {star.temperature ? `${star.temperature} K` : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">
                    Luminosity
                  </span>
                  <p className="text-xl">{star.luminosity || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">
                    Age
                  </span>
                  <p className="text-xl">
                    {star.age ? `${star.age} billion years` : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">
                    Discovered
                  </span>
                  <p className="text-xl">{star.discovered || "N/A"}</p>
                </div>
              </div>
            </div>

            {star.constellation && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Constellation</h2>
                <Link href={`/constellations/${star.constellation.id}`}>
                  <span className="px-4 py-2 bg-purple-900/50 text-purple-200 rounded-full border border-purple-700 hover:bg-purple-800 cursor-pointer transition inline-block">
                    {star.constellation.name}
                  </span>
                </Link>
              </div>
            )}

            {star.planets && star.planets.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">
                  Planets in this star
                </h2>
                <div className="flex flex-wrap gap-3">
                  {star.planets.map((planet) => (
                    <Link
                      key={planet.planet_id}
                      href={`/planets/${planet.planet_id}`}
                    >
                      <span className="px-4 py-2 bg-blue-900/50 text-blue-200 rounded-full border border-blue-700 hover:bg-blue-800 cursor-pointer transition">
                        {planet.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
