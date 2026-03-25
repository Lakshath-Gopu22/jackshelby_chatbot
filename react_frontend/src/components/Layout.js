import NotificationBell from "./NotificationBell";

export default function Layout({ user, onLogout, children, activeTab, onTabChange, tabs }) {
  const isCustomer = user.role === "customer";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-white selection:bg-primary/30 relative">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] bg-cover opacity-5 mix-blend-luminosity pointer-events-none" />

      {/* Sidebar */}
      <div className="w-64 glass-panel m-3 rounded-2xl flex flex-col justify-between p-5 relative z-10 border-t border-l border-white/20 shadow-2xl">
        <div>
          {/* Logo */}
          <div className="mb-8 text-center relative group">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-50 group-hover:scale-100 transition-transform duration-500"></div>
            <h2 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 relative z-10">JACKSHELBY</h2>
            <p className="text-[10px] text-primary font-mono tracking-widest mt-1">LOGISTICS OS v2.0</p>
          </div>

          {/* User Card */}
          <div className="bg-surfaceHover p-3 rounded-xl border border-white/5 mb-5">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Active Session</p>
            <p className="font-bold text-base text-white capitalize">{user.username}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`w-2 h-2 rounded-full ${isCustomer ? 'bg-primary' : 'bg-danger'} animate-pulse`}></span>
              <p className="text-xs text-gray-400 capitalize">{user.role} Module</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-1.5">
            {(tabs || []).map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange && onTabChange(tab.id)}
                className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-white/10 border border-white/15 text-white font-medium"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <span className="text-base opacity-80">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="ml-auto bg-danger/20 text-danger text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-center">
            <NotificationBell userId={user.user_id} />
          </div>
          <button
            onClick={onLogout}
            className="w-full relative group overflow-hidden rounded-xl p-[1px] transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/50 to-orange-500/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-surface hover:bg-white/10 px-4 py-2.5 rounded-xl flex items-center justify-center font-bold tracking-wide transition-colors text-sm">
              <span className="text-gray-300 group-hover:text-white transition-colors">LOGOUT</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 relative z-10 custom-scrollbar">
        {children}
      </div>
    </div>
  );
}