import { useState } from 'react';
import axios from 'axios';
import {
  ShieldCheck,
  ShieldAlert,
  Scan,
  LayoutDashboard,
  Database,
  Settings,
  User,
  Bell,
  Search,
  Activity,
  X,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import LiveScanner from './components/LiveScanner';

// --- Types ---
interface ScanResult {
  status: string;
  score: number;
  message?: string;
  timestamp?: string; // Client-side timestamp
}

// --- Mock Data ---
const MOCK_RECENT_ACTIVITY = [
  { id: 1, type: 'block', message: 'Calculated High Risk Transaction', amount: '$450.00', time: '2 mins ago' },
  { id: 2, type: 'verify', message: 'Identity Verified: Starbucks Corp', amount: '$12.50', time: '5 mins ago' },
  { id: 3, type: 'block', message: 'Suspicious Keyword "Winner"', amount: 'N/A', time: '12 mins ago' },
];

function App() {
  const [view, setView] = useState<'dashboard' | 'scanner'>('dashboard');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle Backend Verification
  const verifyQrCode = async (qrText: string) => {
    setLoading(true);
    setView('dashboard'); // Switch back to dashboard to show result
    setIsScanModalOpen(true); // Open result modal

    try {
      const response = await axios.post('http://127.0.0.1:8000/scan_qr', { qr_text: qrText });
      const result = { ...response.data, timestamp: new Date().toLocaleTimeString() };
      setScanResult(result);

      // Toast Notification
      if (result.status === 'FRAUD') {
        toast.error('High Risk Threat Blocked!', {
          style: { background: '#1e293b', color: '#ef4444', border: '1px solid #ef4444' }
        });
      } else {
        toast.success('Merchant Verified Safe', {
          style: { background: '#1e293b', color: '#10b981', border: '1px solid #10b981' }
        });
      }

    } catch (err) {
      console.error(err);
      setScanResult({ status: 'ERROR', score: 0, message: 'Connection Failed' });
      toast.error('Verification Failed');
    } finally {
      setLoading(false);
    }
  };

  // Simulation Handlers
  const handleSimulateScan = async (isFraud: boolean = true) => {
    setScanResult(null);
    setIsScanModalOpen(true);
    setLoading(true);
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    const qrText = isFraud ? 'upi://scam@ybl' : 'starbucks@okhdfc';
    verifyQrCode(qrText);
  };

  const closeModal = () => {
    setIsScanModalOpen(false);
    setScanResult(null);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden selection:bg-blue-500/30">
      <Toaster position="top-right" />

      {/* 1. Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">SmartShield.AI</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              ${view === 'dashboard'
                ? 'bg-blue-600 shadow-lg shadow-blue-900/20 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium text-sm">Dashboard</span>
          </button>

          <button
            onClick={() => setView('scanner')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              ${view === 'scanner'
                ? 'bg-blue-600 shadow-lg shadow-blue-900/20 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
          >
            <Scan className="w-5 h-5" />
            <span className="font-medium text-sm">Live Scanner</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            <Database className="w-5 h-5" />
            <span className="font-medium text-sm">Merchant Database</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-emerald-400">System Operational</span>
            </div>
            <p className="text-xs text-slate-500">v2.5.0 • Live Cam Enabled</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area OR Scanner View */}
      {view === 'scanner' ? (
        <div className="flex-1 relative bg-black">
          <LiveScanner
            onScan={verifyQrCode}
            onClose={() => setView('dashboard')}
          />
        </div>
      ) : (
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* 2. Top Header */}
          <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-8 z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search threat logs..."
                  className="bg-slate-950 border border-slate-800 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-blue-500/50 w-64 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-emerald-400 tracking-wide">SYSTEM ONLINE</span>
              </div>

              <button className="relative text-slate-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
              </button>
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-slate-800 cursor-pointer">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
            <div className="max-w-6xl mx-auto space-y-8">

              {/* 3. Top Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                  title="Total Scans"
                  value="1,240"
                  icon={Activity}
                  color="blue"
                  trend="+12% today"
                />
                <StatsCard
                  title="Fraud Prevented"
                  value="$45,000"
                  icon={ShieldAlert}
                  color="indigo"
                  trend="+$2.4k saved"
                />
                <StatsCard
                  title="Active Threats"
                  value="2"
                  icon={Scan}
                  color="red"
                  trend="Low Level"
                />
              </div>

              {/* 4. Scanner Section (Dashboard Widget) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[400px]">
                {/* Left: Scan Area */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-1 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-grid-slate-800/20 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>

                  <div className="relative h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900/40 backdrop-blur-sm rounded-xl transition-all">
                    <div className="mb-8 relative">
                      <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                      <Scan className="w-24 h-24 text-blue-500 relative z-10 opacity-80" />
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-2">Initialize Security Scan</h2>
                    <p className="text-slate-400 mb-8 max-w-md">
                      Use your camera to scan a QR code or run a simulation to test the fraud engine.
                    </p>

                    <div className="flex gap-4">
                      <button
                        onClick={() => setView('scanner')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/25 transition-all hover:scale-105 flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        Start Camera Scan
                      </button>
                      <button
                        onClick={() => handleSimulateScan(true)}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg border border-slate-700 transition-all hover:scale-105"
                      >
                        Simulate Fraud
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Recent Activity Sidebar */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
                  <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    Live Feed
                  </h3>
                  <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                    {MOCK_RECENT_ACTIVITY.map((activity) => (
                      <div key={activity.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800/50 hover:border-slate-700 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${activity.type === 'block'
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                            : 'bg-green-500/10 text-green-500 border border-green-500/20'
                            }`}>
                            {activity.type === 'block' ? 'BLOCKED' : 'VERIFIED'}
                          </span>
                          <span className="text-[10px] text-slate-500">{activity.time}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-300 line-clamp-1">{activity.message}</p>
                        {activity.amount !== 'N/A' && (
                          <p className="text-xs text-slate-500 mt-1">{activity.amount}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Recent Activity Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-slate-100">Global Transaction Log</h3>
                  <button className="text-xs text-blue-400 hover:text-blue-300">View All</button>
                </div>
                <table className="w-full text-left text-sm text-slate-400">
                  <thead className="bg-slate-950 text-slate-500 font-medium">
                    <tr>
                      <th className="px-6 py-3">Transaction ID</th>
                      <th className="px-6 py-3">Merchant</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Risk Score</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">TXN-{83920 + i}</td>
                        <td className="px-6 py-4 text-slate-300">Wallet Transfer</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 py-0.5 px-2 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
                            Pending
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[45%]"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono">$120.00</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Result Modal Overlay */}
      <AnimatePresence>
        {isScanModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative"
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 text-center">
                {loading ? (
                  <div className="py-12">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 className="text-xl font-bold text-white mb-2">Analyzing Patterns...</h3>
                    <p className="text-slate-400 text-sm">Checking against global threat database</p>
                  </div>
                ) : scanResult ? (
                  <div>
                    <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${scanResult.status === 'FRAUD' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                      {scanResult.status === 'FRAUD' ? <ShieldAlert className="w-10 h-10" /> : <ShieldCheck className="w-10 h-10" />}
                    </div>

                    <h2 className={`text-2xl font-bold mb-2 ${scanResult.status === 'FRAUD' ? 'text-red-500' : 'text-emerald-400'
                      }`}>
                      {scanResult.status === 'FRAUD' ? 'THREAT DETECTED' : 'TRANSACTION VERIFIED'}
                    </h2>

                    <p className="text-slate-300 font-medium text-lg mb-6">{scanResult.message}</p>

                    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-500 text-sm">Risk Score</span>
                        <span className="font-mono font-bold text-white">{scanResult.score}/100</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${scanResult.status === 'FRAUD' ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                          style={{ width: `${scanResult.score}%` }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={closeModal}
                      className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Close Report
                    </button>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Component for Stats Cards
function StatsCard({ title, value, icon: Icon, color, trend }: any) {
  const colorMap: any = {
    blue: 'text-blue-500 bg-blue-500/10',
    indigo: 'text-indigo-500 bg-indigo-500/10',
    red: 'text-red-500 bg-red-500/10',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${colorMap[color]} `}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-950 px-2 py-1 rounded">
          {trend}
        </span>
      </div>
      <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
    </div>
  );
}

export default App;
