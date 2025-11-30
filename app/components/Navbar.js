"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 py-3 lg:py-0 lg:h-16">
          <Link href="/" className="text-xl lg:text-2xl font-bold text-purple-400 hover:text-purple-300 transition">
            Cosmos Explorer
          </Link>
          <div className="flex items-center space-x-4 flex-1 max-w-2xl w-full lg:mx-8">
            <form onSubmit={handleSearch} className="flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stars, constellations, galaxies, planets..."
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm lg:text-base"
              />
            </form>
          </div>
          <div className="flex flex-wrap justify-center gap-2 lg:gap-4">
            <Link href="/galaxies">
              <button className="px-3 lg:px-4 py-2 text-xs lg:text-sm font-semibold text-white hover:text-purple-300 hover:bg-gray-800 rounded-lg transition">
                Galaxies
              </button>
            </Link>
            <Link href="/stars">
              <button className="px-3 lg:px-4 py-2 text-xs lg:text-sm font-semibold text-white hover:text-yellow-300 hover:bg-gray-800 rounded-lg transition">
                Stars
              </button>
            </Link>
            <Link href="/planets">
              <button className="px-3 lg:px-4 py-2 text-xs lg:text-sm font-semibold text-white hover:text-blue-300 hover:bg-gray-800 rounded-lg transition">
                Planets
              </button>
            </Link>
            <Link href="/constellations">
              <button className="px-3 lg:px-4 py-2 text-xs lg:text-sm font-semibold text-white hover:text-pink-300 hover:bg-gray-800 rounded-lg transition">
                Constellations
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

