import React, { useState, useEffect } from "react";

export default function App() {
  const [page, setPage] = useState("main-menu");
  const [darkMode, setDarkMode] = useState(false);

  // Auto-detect system preference for dark mode
  useEffect(() => {
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(prefersDark);
  }, []);

  return (
    <div className={darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}>
      <Header page={page} setPage={setPage} darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="min-h-screen p-6">
        {page === "main-menu" && <MainMenuPage setPage={setPage} />}
        {page === "system" && <SystemPage darkMode={darkMode} />}
        {page === "about" && <AboutPage />}
        {page === "settings" && <SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} />}
      </main>
      <Footer />
    </div>
  );
}

// Header Component
function Header({ page, setPage, darkMode, setDarkMode }) {
  return (
    <header className={`p-4 shadow-md ${darkMode ? "bg-gray-800" : "bg-green-700 text-white"}`}>
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Smart Solar Parking</h1>
        <nav className="space-x-4">
          <button onClick={() => setPage("main-menu")} className="hover:underline">
            Main Menu
          </button>
          <button onClick={() => setPage("system")} className="hover:underline">
            System
          </button>
          <button onClick={() => setPage("about")} className="hover:underline">
            About
          </button>
          <button onClick={() => setPage("settings")} className="hover:underline">
            Settings
          </button>
        </nav>
      </div>
    </header>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="text-center text-sm py-4 mt-6 text-gray-500">
      &copy; 2025 Smart Solar Parking System | Muhammad Rahmat Ikhwan
    </footer>
  );
}

// Main Menu Page
function MainMenuPage({ setPage }) {
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Main Menu</h2>
      <button
        onClick={() => setPage("system")}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
      >
        Start System
      </button>
      <button
        onClick={() => setPage("about")}
        className="w-full py-3 bg-gray-500 hover:bg-gray-600 text-white rounded transition"
      >
        About
      </button>
      <button
        onClick={() => setPage("settings")}
        className="w-full py-3 bg-gray-500 hover:bg-gray-600 text-white rounded transition"
      >
        Settings
      </button>
    </div>
  );
}

// System Page with MQTT Integration
function SystemPage({ darkMode }) {
  const [slots, setSlots] = useState([
    { id: 1, occupied: false },
    { id: 2, occupied: true },
    { id: 3, occupied: false },
  ]);
  const [rfidInput, setRfidInput] = useState("");
  const [gateOpen, setGateOpen] = useState(false);
  const [invalidAttempts, setInvalidAttempts] = useState(0);
  const [mqttStatus, setMqttStatus] = useState("Connecting...");

  // Simulate MQTT connection
  useEffect(() => {
    const client = mqtt.connect("ws://broker.hivemq.com:8000/mqtt");

    client.on("connect", () => {
      setMqttStatus("Connected to MQTT Broker");
      client.subscribe("smartparking/status");
    });

    client.on("message", (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "rfid") {
          if (data.tag === "AB123456789") {
            alert("✅ Access Granted");
            setGateOpen(true);
            setInvalidAttempts(0);
          } else {
            alert("❌ Invalid Tag");
            setGateOpen(false);
            setInvalidAttempts((prev) => prev + 1);
          }
        }

        if (data.type === "slotUpdate") {
          setSlots(data.slots);
        }
      } catch (e) {
        console.error("Invalid JSON", e);
      }
    });

    return () => {
      client.end();
    };
  }, []);

  const handleRFIDSubmit = () => {
    const payload = {
      type: "rfid",
      tag: rfidInput,
    };

    const client = mqtt.connect("ws://broker.hivemq.com:8000/mqtt");
    client.on("connect", () => {
      client.publish("smartparking/rfid", JSON.stringify(payload));
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-center">Parking System Dashboard</h2>

      {/* MQTT Status */}
      <div className={`p-2 text-center rounded ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}>
        MQTT: {mqttStatus}
      </div>

      {/* RFID Authentication */}
      <div className={`shadow rounded-lg p-4 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <h3 className="font-semibold text-lg mb-2">RFID Authentication</h3>
        <input
          type="text"
          value={rfidInput}
          onChange={(e) => setRfidInput(e.target.value)}
          placeholder="Enter RFID Tag"
          className={`border p-2 w-full mb-2 ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white"}`}
        />
        <button
          onClick={handleRFIDSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Submit
        </button>
        <p className="mt-2">
          Gate Status:{" "}
          <span className={gateOpen ? "text-green-500" : "text-red-500"}>
            {gateOpen ? "Open" : "Closed"}
          </span>
        </p>
        <p>
          Invalid Attempts: <strong>{invalidAttempts}</strong> / 3
          {invalidAttempts >= 3 && (
            <span className="text-red-500 font-bold ml-2">🚨 ALARM!</span>
          )}
        </p>
      </div>

      {/* Parking Slots */}
      <div className={`shadow rounded-lg p-4 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <h3 className="font-semibold text-lg mb-2">Parking Slots</h3>
        <div className="grid grid-cols-3 gap-4">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className={`p-4 border rounded cursor-pointer ${
                slot.occupied ? "bg-red-200" : "bg-green-200"
              }`}
            >
              <h4 className="font-medium">Slot {slot.id}</h4>
              <p>{slot.occupied ? "Occupied" : "Available"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Power Monitoring */}
      <div className={`shadow rounded-lg p-4 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <h3 className="font-semibold text-lg mb-2">Power Monitoring</h3>
        <p>Solar Panel Output: 6W</p>
        <p>Battery Level: 3.7V / 2600mAh</p>
        <p>Status: ✅ Connected</p>
      </div>
    </div>
  );
}

// About Page
function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Tentang Projek</h2>
      <p>
        Sistem ini adalah projek akhir Sarjana Muda Kejuruteraan Elektrik dengan Kepujian dari Universiti Teknikal Malaysia Melaka.
        Projek ini membentangkan pembangunan sistem tempat letak kenderaan anti-kecurian berkuasa solar menggunakan teknologi komunikasi RFID.
      </p>
      <h3 className="text-xl font-semibold">Komponen Utama:</h3>
      <ul className="list-disc list-inside space-y-1">
        <li>ESP32 Microcontroller</li>
        <li>Modul RFID RC522</li>
        <li>Papan Suria 6W</li>
        <li>Bateri Li-ion 3.7V</li>
        <li>Motorservo untuk gate</li>
        <li>LCD 16x2 untuk paparan</li>
      </ul>
      <p>
        Projek ini bertujuan untuk mengurangkan penggunaan kuasa tradisional, meningkatkan keselamatan parkir dan memberi pengalaman pengguna yang lebih baik.
      </p>
    </div>
  );
}

// Settings Page
function SettingsPage({ darkMode, setDarkMode }) {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Tetapan</h2>
      <div className="flex justify-between items-center">
        <span>Dark Mode</span>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`px-4 py-2 rounded ${darkMode ? "bg-yellow-500" : "bg-blue-600 text-white"}`}
        >
          {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
      </div>
      <p>Kini: {darkMode ? "Dark Mode Aktif" : "Light Mode Aktif"}</p>
    </div>
  );
}