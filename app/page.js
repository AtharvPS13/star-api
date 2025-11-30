import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-8 drop-shadow-lg">
          Explore the Cosmos
        </h1>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Discover the wonders of the universe, from distant galaxies to
          mesmerizing constellations.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/galaxies">
            <button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-full shadow-lg transform transition hover:scale-105">
              Explore Galaxies
            </button>
          </Link>
          <Link href="/stars">
            <button className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold py-4 px-8 rounded-full shadow-lg transform transition hover:scale-105">
              Explore Stars
            </button>
          </Link>
          <Link href="/planets">
            <button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-4 px-8 rounded-full shadow-lg transform transition hover:scale-105">
              Explore Planets
            </button>
          </Link>
          <Link href="/constellations">
            <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-full shadow-lg transform transition hover:scale-105">
              Explore Constellations
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
