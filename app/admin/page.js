"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // GALAXY STATE
  const [galaxyName, setGalaxyName] = useState("");
  const [distance, setDistance] = useState("");
  const [mass, setMass] = useState("");
  const [diameter, setDiameter] = useState("");
  const [starNum, setStarNum] = useState("");
  const [type, setType] = useState("");
  const [age, setAge] = useState("");
  const [galaxyImg, setGalaxyImg] = useState("");

  // CONSTELLATION STATE
  const [constellationName, setConstellationName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [constellationImg, setConstellationImg] = useState("");

  // STAR STATE
  const [starName, setStarName] = useState("");
  const [starDistance, setStarDistance] = useState("");
  const [starMass, setStarMass] = useState("");
  const [spectralType, setSpectralType] = useState("");
  const [discovered, setDiscovered] = useState("");
  const [temperature, setTemperature] = useState("");
  const [luminosity, setLuminosity] = useState("");
  const [starAge, setStarAge] = useState("");
  const [starType, setStarType] = useState("");
  const [starGalaxyId, setStarGalaxyId] = useState("");
  const [constellationId, setConstellationId] = useState("");
  const [starImg, setStarImg] = useState("");

  // PLANET STATE
  const [planetName, setPlanetName] = useState("");
  const [moonNo, setMoonNo] = useState("");
  const [planetMass, setPlanetMass] = useState("");
  const [surfaceTemp, setSurfaceTemp] = useState("");
  const [rotation, setRotation] = useState("");
  const [radius, setRadius] = useState("");
  const [planetAge, setPlanetAge] = useState("");
  const [planetGalaxyId, setPlanetGalaxyId] = useState("");
  const [planetType, setPlanetType] = useState("");
  const [planetImg, setPlanetImg] = useState("");

  // Dropdown data
  const [galaxies, setGalaxies] = useState([]);
  const [constellations, setConstellations] = useState([]);

  const router = useRouter();

  // 1. Admin check
  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return router.push("/");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        alert("You are not authorized.");
        return router.push("/");
      }

      setLoading(false);

      // fetch galaxies & constellations for dropdowns
      const { data: galaxyData } = await supabase
        .from("galaxies")
        .select("galaxy_id, name");
      const { data: constellationData } = await supabase
        .from("constellation")
        .select("id, name");

      setGalaxies(galaxyData || []);
      setConstellations(constellationData || []);
    };

    checkAdmin();
  }, [router]);

  // 2. Invite Admin
  const handleInvite = async (e) => {
    e.preventDefault();
    setMessage("Sending invite...");

    const res = await fetch("/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage(`Success! Invite sent to ${email}`);
      setEmail("");
    } else setMessage(`Error: ${data.error}`);
  };

  // 3. Insert Galaxy
  const handleAddGalaxy = async (e) => {
    e.preventDefault();
    setMessage("Adding galaxy...");
    const { error } = await supabase.from("galaxies").insert({
      name: galaxyName,
      distance: distance ? Number(distance) : null,
      mass: mass ? Number(mass) : null,
      diameter: diameter ? Number(diameter) : null,
      star_num: starNum ? Number(starNum) : null,
      type: type || null,
      age: age ? Number(age) : null,
      img: galaxyImg || null,
    });
    if (error) setMessage("Galaxy insert failed: " + error.message);
    else {
      setMessage("Galaxy added successfully!");
      setGalaxyName("");
      setDistance("");
      setMass("");
      setDiameter("");
      setStarNum("");
      setType("");
      setAge("");
      setGalaxyImg("");
      // refresh dropdown
      const { data: galaxyData } = await supabase
        .from("galaxies")
        .select("galaxy_id, name");
      setGalaxies(galaxyData || []);
    }
  };

  // 4. Insert Constellation
  const handleAddConstellation = async (e) => {
    e.preventDefault();
    setMessage("Adding constellation...");
    const { error } = await supabase.from("constellation").insert({
      name: constellationName,
      abbreviation: abbreviation,
      img: constellationImg || null,
    });
    if (error) setMessage("Constellation insert failed: " + error.message);
    else {
      setMessage("Constellation added!");
      setConstellationName("");
      setAbbreviation("");
      setConstellationImg("");
      // refresh dropdown
      const { data: constellationData } = await supabase
        .from("constellation")
        .select("id, name");
      setConstellations(constellationData || []);
    }
  };

  // 5. Insert Star
  const handleAddStar = async (e) => {
    e.preventDefault();
    setMessage("Adding star...");
    const { error } = await supabase.from("stars").insert({
      name: starName,
      distance: starDistance ? Number(starDistance) : null,
      mass: starMass ? Number(starMass) : null,
      spectral_type: spectralType || null,
      discovered: discovered || null,
      temperature: temperature ? Number(temperature) : null,
      luminosity: luminosity ? Number(luminosity) : null,
      age: starAge ? Number(starAge) : null,
      star_type: starType || null,
      galaxy_id: starGalaxyId ? Number(starGalaxyId) : null,
      constellation_id: constellationId ? Number(constellationId) : null,
      img: starImg || null,
    });
    if (error) setMessage("Star insert failed: " + error.message);
    else {
      setMessage("Star added!");
      setStarName("");
      setStarDistance("");
      setStarMass("");
      setSpectralType("");
      setDiscovered("");
      setTemperature("");
      setLuminosity("");
      setStarAge("");
      setStarType("");
      setStarGalaxyId("");
      setConstellationId("");
      setStarImg("");
    }
  };

  // 6. Insert Planet
  const handleAddPlanet = async (e) => {
    e.preventDefault();
    setMessage("Adding planet...");
    const { error } = await supabase.from("planets").insert({
      name: planetName,
      moon_no: moonNo ? Number(moonNo) : null,
      mass: planetMass ? Number(planetMass) : null,
      surface_temp: surfaceTemp ? Number(surfaceTemp) : null,
      rotation_peried: rotation ? Number(rotation) : null,
      radius: radius ? Number(radius) : null,
      age: planetAge ? Number(planetAge) : null,
      galaxy_id: planetGalaxyId ? Number(planetGalaxyId) : null,
      planet_type: planetType || null,
      img: planetImg || null,
    });
    if (error) setMessage("Planet insert failed: " + error.message);
    else {
      setMessage("Planet added!");
      setPlanetName("");
      setMoonNo("");
      setPlanetMass("");
      setSurfaceTemp("");
      setRotation("");
      setRadius("");
      setPlanetAge("");
      setPlanetGalaxyId("");
      setPlanetType("");
      setPlanetImg("");
    }
  };

  if (loading)
    return <div className="p-10 text-white">Verifying Admin Status...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-purple-500 mb-8">
        Admin Sanctuary
      </h1>

      {/* Invite Admin */}
      <div className="bg-gray-800 p-8 rounded-xl border border-purple-500/30 w-full max-w-md mb-10">
        <h2 className="text-xl mb-4">Invite New Admin</h2>
        <form onSubmit={handleInvite} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="future_admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
            required
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded font-bold"
          >
            Send Invite
          </button>
        </form>
      </div>

      {/* Add Galaxy */}
      <div className="bg-gray-800 p-8 rounded-xl border border-green-500/30 w-full max-w-md mb-10">
        <h2 className="text-xl mb-4">Add New Galaxy</h2>
        <form onSubmit={handleAddGalaxy} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Galaxy Name"
            value={galaxyName}
            onChange={(e) => setGalaxyName(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
            required
          />
          <input
            type="number"
            placeholder="Distance"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <input
            type="number"
            placeholder="Mass"
            value={mass}
            onChange={(e) => setMass(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <input
            type="number"
            placeholder="Diameter"
            value={diameter}
            onChange={(e) => setDiameter(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <input
            type="number"
            placeholder="Star Count"
            value={starNum}
            onChange={(e) => setStarNum(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <input
            type="text"
            placeholder="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <input
            type="text"
            placeholder="Image URL"
            value={galaxyImg}
            onChange={(e) => setGalaxyImg(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded font-bold"
          >
            Add Galaxy
          </button>
        </form>
      </div>

      {/* Add Constellation */}
      <div className="bg-gray-800 p-8 rounded-xl border border-indigo-500/30 w-full max-w-md mb-10">
        <h2 className="text-xl mb-4">Add Constellation</h2>
        <form onSubmit={handleAddConstellation} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name"
            value={constellationName}
            onChange={(e) => setConstellationName(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
            required
          />
          <input
            type="text"
            placeholder="Abbreviation"
            value={abbreviation}
            onChange={(e) => setAbbreviation(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
            required
          />
          <input
            type="text"
            placeholder="Image URL"
            value={constellationImg}
            onChange={(e) => setConstellationImg(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded font-bold"
          >
            Add Constellation
          </button>
        </form>
      </div>

      {/* Add Star */}
      <div className="bg-gray-800 p-8 rounded-xl border border-blue-500/30 w-full max-w-md mb-10">
        <h2 className="text-xl mb-4">Add Star</h2>
        <form onSubmit={handleAddStar} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Star Name"
            value={starName}
            onChange={(e) => setStarName(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
            required
          />
          <input
            type="number"
            placeholder="Distance"
            value={starDistance}
            onChange={(e) => setStarDistance(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <input
            type="number"
            placeholder="Mass"
            value={starMass}
            onChange={(e) => setStarMass(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <input
            type="text"
            placeholder="Spectral Type"
            value={spectralType}
            onChange={(e) => setSpectralType(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <input
            type="date"
            placeholder="Discovered"
            value={discovered}
            onChange={(e) => setDiscovered(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <input
            type="number"
            placeholder="Temperature"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <input
            type="number"
            placeholder="Luminosity"
            value={luminosity}
            onChange={(e) => setLuminosity(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <input
            type="number"
            placeholder="Age"
            value={starAge}
            onChange={(e) => setStarAge(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <input
            type="text"
            placeholder="Star Type"
            value={starType}
            onChange={(e) => setStarType(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />

          {/* Galaxy Dropdown */}
          <select
            value={starGalaxyId}
            onChange={(e) => setStarGalaxyId(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          >
            <option value="">Select Galaxy</option>
            {galaxies.map((g) => (
              <option key={g.galaxy_id} value={g.galaxy_id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Constellation Dropdown */}
          <select
            value={constellationId}
            onChange={(e) => setConstellationId(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          >
            <option value="">Select Constellation</option>
            {constellations.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Image URL"
            value={starImg}
            onChange={(e) => setStarImg(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-bold"
          >
            Add Star
          </button>
        </form>
      </div>

      {/* Add Planet */}
      <div className="bg-gray-800 p-8 rounded-xl border border-yellow-500/30 w-full max-w-md mb-10">
        <h2 className="text-xl mb-4">Add Planet</h2>
        <form onSubmit={handleAddPlanet} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Planet Name"
            value={planetName}
            onChange={(e) => setPlanetName(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
            required
          />
          <input
            type="number"
            placeholder="Moon Count"
            value={moonNo}
            onChange={(e) => setMoonNo(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <input
            type="number"
            placeholder="Mass"
            value={planetMass}
            onChange={(e) => setPlanetMass(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <input
            type="number"
            placeholder="Surface Temp"
            value={surfaceTemp}
            onChange={(e) => setSurfaceTemp(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <input
            type="number"
            placeholder="Rotation Period"
            value={rotation}
            onChange={(e) => setRotation(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <input
            type="number"
            placeholder="Radius"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <input
            type="number"
            placeholder="Age"
            value={planetAge}
            onChange={(e) => setPlanetAge(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />

          {/* Galaxy Dropdown */}
          <select
            value={planetGalaxyId}
            onChange={(e) => setPlanetGalaxyId(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
            required
          >
            <option value="">Select Galaxy</option>
            {galaxies.map((g) => (
              <option key={g.galaxy_id} value={g.galaxy_id}>
                {g.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Planet Type"
            value={planetType}
            onChange={(e) => setPlanetType(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <input
            type="text"
            placeholder="Image URL"
            value={planetImg}
            onChange={(e) => setPlanetImg(e.target.value)}
            className="p-3 rounded bg-gray-700 border border-gray-600"
          />
          <button
            type="submit"
            className="bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded font-bold"
          >
            Add Planet
          </button>
        </form>
      </div>

      {message && (
        <p className="mt-4 text-center text-sm text-yellow-300">{message}</p>
      )}
    </div>
  );
}
