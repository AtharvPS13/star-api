import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getConstellationImage } from "../getConstellationImage";

export default async function ConstellationDetailPage({ params }) {
  const { id } = await params;
  
  // First, get all constellations to find the index
  const { data: allConstellations } = await supabase
    .from("constellation")
    .select('id')
    .order('id');
  
  const constellationIndex = allConstellations?.findIndex(c => c.id === parseInt(id)) ?? -1;
  
  const { data: constellation, error } = await supabase
    .from("constellation")
    .select(`
      id,
      name,
      abbreviation,
      stars (
        id,
        name,
        distance,
        star_type
      )
    `)
    .eq("id", id)
    .single();

  if (error || !constellation) {
    notFound();
  }

  return (
    <div className="p-10 bg-gray-900 min-h-screen text-white">
      <Link href="/constellations" className="text-purple-400 hover:text-purple-300 mb-4 inline-block">
        ← Back to Constellations
      </Link>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="h-64 relative overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-800">
            <Image
              src={getConstellationImage(constellationIndex)}
              alt={constellation.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent flex items-end">
              <h1 className="text-4xl font-bold text-white p-6">{constellation.name}</h1>
            </div>
          </div>

          <div className="p-8">
            <h1 className="text-4xl font-bold mb-2">{constellation.name}</h1>
            {constellation.abbreviation && (
              <p className="text-xl text-gray-400 mb-6">({constellation.abbreviation})</p>
            )}
            
            {/* Stars Section */}
            {constellation.stars && constellation.stars.length > 0 ? (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Stars in this Constellation</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {constellation.stars.map((star) => (
                    <Link key={star.id} href={`/stars/${star.id}`}>
                      <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:bg-gray-600 transition cursor-pointer">
                        <h3 className="text-lg font-semibold mb-2">{star.name}</h3>
                        <div className="text-sm text-gray-400 space-y-1">
                          {star.star_type && (
                            <p><span className="text-gray-500">Type:</span> {star.star_type}</p>
                          )}
                          {star.distance && (
                            <p><span className="text-gray-500">Distance:</span> {star.distance} light years</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-8">
                <p className="text-gray-400">No stars recorded for this constellation yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

