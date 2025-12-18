"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthProvider";

export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { user, signOut } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const closeDropdown = () => setIsDropdownOpen(false);

  return (
    <nav className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 py-3 lg:py-0 lg:h-16">
          <Link
            href="/"
            className="text-xl lg:text-2xl font-bold text-purple-400 hover:text-purple-300 transition"
          >
            Star-API
          </Link>

          <div className="flex items-center space-x-4 flex-1 max-w-2xl w-full lg:mx-8">
            <form onSubmit={handleSearch} className="flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search the cosmos..."
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm lg:text-base"
              />
            </form>
          </div>

          <div className="flex flex-wrap justify-center gap-4 items-center relative">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-4 py-2 text-sm font-semibold text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
              >
                Explore
                <span
                  className={`transform transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {isDropdownOpen && (
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
                  <Link href="/galaxies" onClick={closeDropdown}>
                    <div className="px-4 py-3 hover:bg-gray-700 text-purple-300 hover:text-white transition cursor-pointer border-b border-gray-700/50 text-center">
                      Galaxies
                    </div>
                  </Link>
                  <Link href="/stars" onClick={closeDropdown}>
                    <div className="px-4 py-3 hover:bg-gray-700 text-yellow-300 hover:text-white transition cursor-pointer border-b border-gray-700/50 text-center">
                      Stars
                    </div>
                  </Link>
                  <Link href="/planets" onClick={closeDropdown}>
                    <div className="px-4 py-3 hover:bg-gray-700 text-blue-300 hover:text-white transition cursor-pointer border-b border-gray-700/50 text-center">
                      Planets
                    </div>
                  </Link>
                  <Link href="/constellations" onClick={closeDropdown}>
                    <div className="px-4 py-3 hover:bg-gray-700 text-pink-300 hover:text-white transition cursor-pointer text-center">
                      Constellations
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-gray-700 hidden lg:block"></div>

            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/admin">
                  <button className="px-4 py-2 text-sm font-bold text-emerald-400 border border-emerald-400/30 hover:bg-emerald-900/20 rounded-lg transition flex items-center gap-2">
                    <span>⚡</span> Dashboard
                  </button>
                </Link>

                <button
                  onClick={signOut}
                  className="px-4 py-2 text-sm font-bold text-red-400 border border-red-400/30 hover:bg-red-900/20 rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login">
                <button className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition flex items-center gap-2">
                  <span>🔒</span> Admin
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
