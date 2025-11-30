import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { getStarImage } from "./getStarImage";

export default async function StarsPage() {
  const { data: stars, error } = await supabase
    .from("stars")
    .select(`
      id,
      name,
      star_type,
      distance
    `);

  if (error) {
    return (
      <div className="text-red-500 p-10">Error fetching data: {error.message}</div>
    );
  }

  return (
    <div className="p-10 bg-gray-900 min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-8 text-center text-purple-400">
        Stars
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stars?.map((star) => (
          <Link key={star.id} href={`/stars/${star.id}`}>
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:shadow-yellow-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
              <div className="h-48 relative overflow-hidden">
                <Image
                  src={getStarImage(star.star_type)}
                  alt={star.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h2 className="text-2xl font-bold mb-2">{star.name}</h2>
                <p className="text-gray-400">
                  <span className="text-gray-500">Type:</span> {star.star_type || 'N/A'}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
