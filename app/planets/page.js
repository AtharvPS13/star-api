import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { getPlanetImage } from "./getPlanetImage";

export default async function PlanetsPage() {
  const { data: planets, error } = await supabase
    .from("planets")
    .select(`
      planet_id,
      name,
      moon_no,
      mass,
      planet_type
    `);

  if (error) {
    return (
      <div className="text-red-500 p-10">Error fetching data: {error.message}</div>
    );
  }

  return (
    <div className="p-10 bg-gray-900 min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-8 text-center text-purple-400">
        Planets
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planets?.map((planet) => (
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
                <h2 className="text-2xl font-bold mb-2">{planet.name}</h2>
                <p className="text-gray-400 mt-1">
                  <span className="text-gray-500">Type:</span> {planet.planet_type && planet.planet_id != "Placeholder Object" ? `${planet.planet_type}` : 'No type assigned'}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
