export default function Layout({ user, onLogout, children }) {
  const isCustomer = user.role === "customer";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-white selection:bg-primary/30 relative">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] bg-cover opacity-5 mix-blend-luminosity pointer-events-none" />

      {/* Sidebar Glass Panel */}
      <div className="w-72 glass-panel m-4 rounded-3xl flex flex-col justify-between p-6 relative z-10 border-t border-l border-white/20 shadow-2xl">
        <div>
          <div className="mb-10 text-center relative group">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-50 group-hover:scale-100 transition-transform duration-500"></div>
            <h2 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 relative z-10">JACKSHELBY</h2>
            <p className="text-xs text-primary font-mono tracking-widest mt-1">LOGISTICS OS</p>
          </div>

          <div className="bg-surfaceHover p-4 rounded-2xl border border-white/5 mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Active Session</p>
            <p className="font-bold text-lg text-white capitalize">{user.username}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-2 h-2 rounded-full ${isCustomer ? 'bg-primary' : 'bg-danger'} animate-pulse`}></span>
              <p className="text-sm text-gray-400 capitalize">{user.role} Module</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="w-full glass-panel px-4 py-3 rounded-xl border border-white/10 flex items-center gap-3 text-white bg-white/5">
              <span className="text-primary opacity-80">⊞</span>
              <span className="font-medium text-sm">Dashboard</span>
            </div>
            {/* Additional simulated links could go here */}
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full relative group overflow-hidden rounded-xl p-[1px] transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/50 to-orange-500/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative bg-surface hover:bg-white/10 px-6 py-3 rounded-xl flex items-center justify-center font-bold tracking-wide transition-colors">
            <span className="text-gray-300 group-hover:text-white transition-colors">TERMINATE SESSION</span>
          </div>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">
        {children}
      </div>
    </div>
  );
}