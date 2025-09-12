export default function NetworkGraph() {
  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Wallet Network Connections</h3>
      <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 p-4">
          {/* Central high-activity node */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg z-10"></div>
          
          {/* Connected nodes with varying sizes */}
          <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-[var(--argus-blue)] rounded-full border-2 border-white shadow"></div>
          <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-[var(--argus-green)] rounded-full border-2 border-white shadow"></div>
          <div className="absolute bottom-1/4 left-1/3 w-5 h-5 bg-amber-500 rounded-full border-2 border-white shadow"></div>
          <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-slate-400 rounded-full border-2 border-white shadow"></div>
          <div className="absolute top-1/2 left-1/6 w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow"></div>
          <div className="absolute top-1/6 left-1/2 w-5 h-5 bg-orange-500 rounded-full border-2 border-white shadow"></div>
          
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="#cbd5e1" strokeWidth="2" opacity="0.6"/>
            <line x1="50%" y1="50%" x2="75%" y2="33%" stroke="#cbd5e1" strokeWidth="2" opacity="0.6"/>
            <line x1="50%" y1="50%" x2="33%" y2="75%" stroke="#cbd5e1" strokeWidth="3" opacity="0.8"/>
            <line x1="50%" y1="50%" x2="67%" y2="67%" stroke="#cbd5e1" strokeWidth="1" opacity="0.4"/>
            <line x1="50%" y1="50%" x2="17%" y2="50%" stroke="#cbd5e1" strokeWidth="2" opacity="0.6"/>
            <line x1="50%" y1="50%" x2="50%" y2="17%" stroke="#cbd5e1" strokeWidth="2" opacity="0.6"/>
          </svg>
        </div>
        <div className="text-center z-20 relative">
          <div className="text-xs text-slate-500 mt-20">
            <div className="flex justify-center space-x-4 text-xs">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>High Risk
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-[var(--argus-blue)] rounded-full mr-1"></div>Medium Risk
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-[var(--argus-green)] rounded-full mr-1"></div>Low Risk
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
