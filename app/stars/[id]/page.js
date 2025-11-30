import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getStarImage } from "../getStarImage";

export default async function StarDetailPage({ params }) {
  const { id } = await params;
  
  const { data: star, error } = await supabase
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
    `)
    .eq("id", id)
    .single();

  if (error || !star) {
    notFound();
  }

  return (
    <div className="p-10 bg-gray-900 min-h-screen text-white">
      <Link href="/stars" className="text-yellow-400 hover:text-yellow-300 mb-4 inline-block">
        ← Back to Stars
      </Link>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="h-64 relative overflow-hidden">
            <Image
              src={getStarImage(star.star_type)}
              alt={star.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent flex items-end">
              <h1 className="text-4xl font-bold text-white p-6">{star.name}</h1>
            </div>
          </div>

          <div className="p-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">Star Type</span>
                  <p className="text-xl">{star.star_type || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">Spectral Type</span>
                  <p className="text-xl">{star.spectral_type || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">Distance</span>
                  <p className="text-xl">{star.distance ? `${star.distance} light years` : 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">Mass</span>
                  <p className="text-xl">{star.mass ? `${star.mass} kg` : 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">Temperature</span>
                  <p className="text-xl">{star.temperature ? `${star.temperature} K` : 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">Luminosity</span>
                  <p className="text-xl">{star.luminosity || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">Age</span>
                  <p className="text-xl">{star.age ? `${star.age} years` : 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">Discovered</span>
                  <p className="text-xl">{star.discovered || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Galaxy Link */}
            {star.galaxies && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Galaxy</h2>
                <Link href={`/galaxies/${star.galaxies.galaxy_id}`}>
                  <span className="px-4 py-2 bg-indigo-900/50 text-indigo-200 rounded-full border border-indigo-700 hover:bg-indigo-800 cursor-pointer transition inline-block">
                    {star.galaxies.name}
                  </span>
                </Link>
              </div>
            )}

            {/* Constellation Link */}
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
          </div>
        </div>
      </div>
    </div>
  );
}

