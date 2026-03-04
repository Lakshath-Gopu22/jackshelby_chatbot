export default function RoleSelect({ setRole }) {
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
          <p className="text-2xl text-gray-300 font-light tracking-wide">Next Generation Logistics AI</p>
        </div>
      </div>

      {/* Right Selection Section */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 relative z-20">
        {/* Ambient Orbs */}
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse-slow pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] -z-10 animate-pulse pointer-events-none"></div>

        <div className="w-full max-w-md glass-panel p-10 rounded-3xl animate-[fadeIn_1s_ease-out]">
          <h2 className="text-3xl font-bold mb-2">Select Portal</h2>
          <p className="text-gray-400 mb-10 text-sm">Identify your access level to engage the system</p>

          <div className="space-y-5">
            <button
              onClick={() => setRole("customer")}
              className="w-full relative group overflow-hidden rounded-xl p-[1px] text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative glass-panel px-6 py-5 rounded-xl flex items-center justify-between group-hover:bg-white/5 transition-colors duration-300">
                <div className="flex flex-col">
                  <span className="font-semibold text-lg drop-shadow-md">Customer Portal</span>
                  <span className="text-sm text-gray-400 mt-1">Track orders & chat with AI agent</span>
                </div>
                <span className="text-primary text-2xl group-hover:translate-x-2 transition-transform duration-300">→</span>
              </div>
            </button>

            <button
              onClick={() => setRole("admin")}
              className="w-full relative group overflow-hidden rounded-xl p-[1px] text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-danger to-warning opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative glass-panel px-6 py-5 rounded-xl flex items-center justify-between group-hover:bg-white/5 transition-colors duration-300">
                <div className="flex flex-col">
                  <span className="font-semibold text-lg drop-shadow-md">Admin Console</span>
                  <span className="text-sm text-gray-400 mt-1">Global analytics & system oversight</span>
                </div>
                <span className="text-danger text-2xl group-hover:translate-x-2 transition-transform duration-300">→</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}