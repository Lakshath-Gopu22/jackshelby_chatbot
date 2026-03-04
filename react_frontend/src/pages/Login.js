import { useState } from "react";
import { login } from "../services/api";

export default function Login({ setUser, role, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");
    setLoading(true);
    const data = await login(username, password);
    setLoading(false);

    if (data.role) {
      setUser(data);
    } else {
      setError("Authorization failed. Invalid credentials.");
    }
  }

  const isCustomer = role === "customer";
  const primaryGradient = isCustomer ? "from-primary to-accent" : "from-danger to-warning";
  const primaryColor = isCustomer ? "text-primary" : "text-danger";

  return (
    <div className="flex h-screen w-full overflow-hidden absolute inset-0 text-white">
      {/* Left Image Section */}
      <div className="hidden lg:flex w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop"
          alt="JackShelby Logistics"
          className="object-cover w-full h-full opacity-50 mix-blend-luminosity scale-105"
        />
        <div className="absolute bottom-20 left-20 z-20">
          <h1 className="text-7xl font-black tracking-tighter mb-4 pr-10 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent animate-float">
            JACKSHELBY
          </h1>
          <p className="text-2xl text-gray-300 font-light tracking-wide">JackShelby Auth</p>
        </div>
      </div>

      {/* Right Login Section */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 relative z-20">
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse-slow pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] -z-10 animate-pulse pointer-events-none"></div>

        <div className="w-full max-w-md glass-panel p-10 rounded-3xl animate-[fadeIn_0.5s_ease-out]">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <span className={`text-xs font-bold tracking-widest uppercase ${primaryColor} mb-2 block`}>
                {isCustomer ? 'Customer Portal' : 'Admin Console'}
              </span>
              <h2 className="text-3xl font-bold mb-2">Secure Login</h2>
              <p className="text-gray-400 text-sm">Enter your credentials to access the nexus</p>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="text-gray-500 hover:text-white transition-colors text-sm underline pb-1"
              >
                Go Back
              </button>
            )}
          </div>

          {error && (
            <div className="bg-danger/20 border border-danger/50 text-danger text-sm px-4 py-3 rounded-lg mb-6 flex items-center">
              <span>⚠️ {error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wide">Username</label>
              <input
                type="text"
                className="w-full bg-surfaceHover border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-mono"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wide">Password</label>
              <input
                type="password"
                className="w-full bg-surfaceHover border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-mono"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div className="pt-4">
              <button
                onClick={handleLogin}
                disabled={loading || !username || !password}
                className={`w-full relative group overflow-hidden rounded-xl p-[1px] transition-all ${(!username || !password || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${primaryGradient} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                <div className="relative bg-background/50 backdrop-blur-sm px-6 py-4 rounded-xl flex items-center justify-center font-bold tracking-wide">
                  {loading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}