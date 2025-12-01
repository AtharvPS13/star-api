import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPlanetImage } from "../getPlanetImage";
import PlanetSystemSimulation from "@/components/PlanetSystemSimulation";
import { formatNumber } from "@/lib/formatNumber";

export default async function PlanetDetailPage({ params }) {
  const { id } = await params;

  const { data: planet, error } = await supabase
    .from("planets")
    .select(
      `
      *,
      galaxies (
        galaxy_id,
        name
      ),
      star_system (
        stars (
          id,
          name
        )
      )
    `,
    )
    .eq("planet_id", id)
    .single();

  if (error || !planet) {
    console.error("Error fetching planet:", error);
    notFound();
  }

  const parentGalaxy = Array.isArray(planet.galaxies)
    ? planet.galaxies[0]
    : planet.galaxies;

  const starSystemData = Array.isArray(planet.star_system)
    ? planet.star_system[0]
    : planet.star_system;

  const parentStar = starSystemData ? starSystemData.stars : null;

  return (
    <div className="p-10 bg-gray-900 min-h-screen text-white">
      <nav className="text-sm text-gray-400 mb-8 flex items-center space-x-2 flex-wrap">
        <Link href="/" className="hover:text-blue-400 transition">
          Universe
        </Link>
        <span>&gt;</span>

        {parentGalaxy ? (
          <Link
            href={`/galaxies/${parentGalaxy.galaxy_id}`}
            className="hover:text-blue-400 transition"
          >
            Galaxy: {parentGalaxy.name}
          </Link>
        ) : (
          <span className="text-gray-600">Unknown Galaxy</span>
        )}

        <span>&gt;</span>

        {parentStar ? (
          <Link
            href={`/stars/${parentStar.id}`}
            className="hover:text-blue-400 transition"
          >
            Star: {parentStar.name}
          </Link>
        ) : (
          <span className="text-gray-600">Unknown Star</span>
        )}

        <span>&gt;</span>
        <span className="text-blue-300 font-medium">Planet: {planet.name}</span>
      </nav>

      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="h-64 relative overflow-hidden">
            <PlanetSystemSimulation planetData={planet} />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent flex items-end">
              <h1 className="text-4xl font-bold text-white p-6">
                {planet.name}
              </h1>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">
                    Type
                  </span>
                  <p className="text-xl">{planet.planet_type || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">
                    Mass
                  </span>
                  <p className="text-xl">
                    {planet.mass ? `${formatNumber(planet.mass)} kg` : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">
                    Radius
                  </span>
                  <p className="text-xl">
                    {planet.radius ? `${formatNumber(planet.radius)} km` : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">
                    Number of Moons
                  </span>
                  <p className="text-xl">{planet.moon_no || 0}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">
                    Surface Temperature
                  </span>
                  <p className="text-xl">
                    {planet.surface_temp ? `${planet.surface_temp} K` : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">
                    Age
                  </span>
                  <p className="text-xl">
                    {planet.age ? `${planet.age} billion years` : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {parentStar && (
              <div className="mt-8 border-t border-gray-700 pt-6">
                <h2 className="text-2xl font-bold mb-4">Orbiting Star</h2>
                <Link href={`/stars/${parentStar.id}`}>
                  <span className="px-5 py-2.5 bg-yellow-900/40 text-yellow-200 rounded-full border border-yellow-600/50 hover:bg-yellow-800/60 cursor-pointer transition inline-flex items-center gap-2">
                    <span className="text-lg">☀️</span> {parentStar.name}
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
