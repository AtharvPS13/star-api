import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getGalaxyImage } from "../getGalaxyImage";

export default async function GalaxyDetailPage({ params }) {
  const { id } = await params;
  
  const { data: galaxy, error } = await supabase
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
    `)
    .eq("galaxy_id", id)
    .single();

  if (error || !galaxy) {
    notFound();
  }

  return (
    <div className="p-10 bg-gray-900 min-h-screen text-white">
      <Link href="/galaxies" className="text-purple-400 hover:text-purple-300 mb-4 inline-block">
        ← Back to Galaxies
      </Link>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="h-64 relative overflow-hidden">
            <Image
              src={getGalaxyImage(galaxy.type)}
              alt={galaxy.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent flex items-end">
              <h1 className="text-4xl font-bold text-white p-6">{galaxy.name}</h1>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">Type</span>
                  <p className="text-xl">{galaxy.type || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">Distance</span>
                  <p className="text-xl">{galaxy.distance ? `${galaxy.distance} light years` : 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">Mass</span>
                  <p className="text-xl">{galaxy.mass ? `${galaxy.mass} kg` : 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">Diameter</span>
                  <p className="text-xl">{galaxy.diameter ? `${galaxy.diameter} km` : 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">Number of Stars</span>
                  <p className="text-xl">{galaxy.star_num || 0}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">Age</span>
                  <p className="text-xl">{galaxy.age ? `${galaxy.age} years` : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Stars Section */}
            {galaxy.stars && galaxy.stars.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Stars in this Galaxy</h2>
                <div className="flex flex-wrap gap-3">
                  {galaxy.stars.map((star) => (
                    <Link key={star.id} href={`/stars/${star.id}`}>
                      <span className="px-4 py-2 bg-purple-900/50 text-purple-200 rounded-full border border-purple-700 hover:bg-purple-800 cursor-pointer transition">
                        {star.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Planets Section */}
            {galaxy.planets && galaxy.planets.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Planets in this Galaxy</h2>
                <div className="flex flex-wrap gap-3">
                  {galaxy.planets.map((planet) => (
                    <Link key={planet.planet_id} href={`/planets/${planet.planet_id}`}>
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

