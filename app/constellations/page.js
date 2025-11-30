import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { getConstellationImage } from "./getConstellationImage";

export default async function ConstellationsPage() {
  const { data: constellations, error } = await supabase.from("constellation")
    .select(`
      id,
      name,
      abbreviation
    `)
    .order('id');

  if (error) {
    return (
      <div className="text-red-500 p-10">Error fetching data: {error.message}</div>
    );
  }

  return (
    <div className="p-10 bg-gray-900 min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-8 text-center text-purple-400">
        Constellations
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {constellations?.map((constellation, index) => (
          <Link key={constellation.id} href={`/constellations/${constellation.id}`}>
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:shadow-purple-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
              <div className="h-48 relative overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-800">
                <Image
                  src={getConstellationImage(index)}
                  alt={constellation.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent flex items-end p-4">
                  <span className="text-white font-semibold text-lg">{constellation.name}</span>
                </div>
              </div>
              <div className="p-5">
                <h2 className="text-2xl font-bold mb-2">{constellation.name}</h2>
                {constellation.abbreviation && (
                  <p className="text-gray-400">
                    <span className="text-gray-500">Abbreviation:</span> {constellation.abbreviation}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
