import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { getGalaxyImage } from "./getGalaxyImage";

export default async function GalaxiesPage() {
  const { data: galaxies, error } = await supabase
    .from("galaxies")
    .select(`
      galaxy_id,
      name,
      type,
      star_num
    `);

  if (error) {
    return (
      <div className="text-red-500 p-10">Error fetching data: {error.message}</div>
    );
  }

  return (
    <div className="p-10 bg-gray-900 min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-8 text-center text-purple-400">
        Galaxies
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galaxies?.map((galaxy) => (
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
                <h2 className="text-2xl font-bold mb-2">{galaxy.name}</h2>
                <p className="text-gray-400">
                  <span className="text-gray-500">Type:</span> {galaxy.type || 'N/A'}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
