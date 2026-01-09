import { useState, useEffect } from 'react';
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
  Camera,
  ToggleLeft,
  ToggleRight,
  Download,
  FileText,
  LogOut,
  Globe,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import LiveScanner from './components/LiveScanner';

// --- Configuration ---
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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

const merchantsData = [
  { id: "M001", name: "Starbucks Corp", trust: 98, status: "Verified" },
  { id: "M002", name: "Uber India", trust: 95, status: "Verified" },
  { id: "M009", name: "Laxmi Chit Fund", trust: 10, status: "Blacklisted" },
  { id: "M012", name: "Win_Lottery_X", trust: 5, status: "Blacklisted" }
];

function App() {
  const [view, setView] = useState<'dashboard' | 'scanner' | 'database' | 'settings' | 'map'>('dashboard');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Settings State
  const [voiceAlerts, setVoiceAlerts] = useState(true);
  const [autoBlock, setAutoBlock] = useState(false);

  // --- 1. Audio Interaction Unlocker (For Mobile) ---
  useEffect(() => {
    const unlockAudio = () => {
      // Play a silent sound to unlock AudioContext/SpeechSynthesis on iOS/Android
      const audio = new Audio();
      audio.play().catch(() => { });
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // --- 2. System Connect Check (Green Toast) ---
  useEffect(() => {
    // Simulate checking system status
    const checkSystem = async () => {
      try {
        // Try to hit the root or just verify server is alive
        // Using a simple timeout simulation for "System Connected" visual
        // In production flip to real axios call: await axios.get(`${API_URL}/`);
        toast.success('System Connected: Online', {
          id: 'system-connect',
          icon: '✅',
          style: { background: '#1e293b', color: '#4ade80', border: '1px solid #4ade80' }
        });
      } catch (e) {
        console.error("System check failed", e);
      }
    };

    checkSystem();
  }, []);


  // Handle Backend Verification
  const verifyQrCode = async (qrText: string) => {
    setLoading(true);
    setView('dashboard'); // Switch back to dashboard to show result
    setIsScanModalOpen(true); // Open result modal

    try {
      const response = await axios.post(`${API_URL}/scan_qr`, { qr_text: qrText });
      const result = { ...response.data, timestamp: new Date().toLocaleTimeString() };
      setScanResult(result);

      // Voice Alert & Toast Notification
      if (result.status === 'FRAUD') {
        // Voice Alert
        if (voiceAlerts) {
          const utterance = new SpeechSynthesisUtterance("Warning. High Risk Detected.");
          window.speechSynthesis.speak(utterance);
        }

        toast.error('High Risk Threat Blocked!', {
          style: { background: '#1e293b', color: '#ef4444', border: '1px solid #ef4444' }
        });
      } else {
        // Voice Alert
        if (voiceAlerts) {
          const utterance = new SpeechSynthesisUtterance("Transaction Verified.");
          window.speechSynthesis.speak(utterance);
        }

        toast.success('Merchant Verified Safe', {
          style: { background: '#1e293b', color: '#10b981', border: '1px solid #10b981' }
        });
      }

    } catch (err) {
      console.error(err);
      setScanResult({ status: 'ERROR', score: 0, message: 'Connection Failed' });

      // --- 3. Error Handling Toast (Red) ---
      toast.error('Backend Offline: Connection Refused', {
        icon: '❌',
        style: { background: '#1e293b', color: '#ef4444', border: '1px solid #ef4444' }
      });

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

  const filteredMerchants = merchantsData.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden selection:bg-blue-500/30">
      <Toaster position="top-right" />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
        />
      )}

      {/* 1. Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">SmartShield.AI</span>
          <button onClick={() => setIsSidebarOpen(false)} className="ml-auto md:hidden text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }}
            aria-label="Dashboard"
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
            onClick={() => { setView('scanner'); setIsSidebarOpen(false); }}
            aria-label="Live Scanner"
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
            onClick={() => { setView('map'); setIsSidebarOpen(false); }}
            aria-label="Threat Map"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              ${view === 'map'
                ? 'bg-blue-600 shadow-lg shadow-blue-900/20 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
          >
            <Globe className="w-5 h-5" />
            <span className="font-medium text-sm">Threat Map</span>
          </button>

          <button
            onClick={() => { setView('database'); setIsSidebarOpen(false); }}
            aria-label="Merchant Database"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              ${view === 'database'
                ? 'bg-blue-600 shadow-lg shadow-blue-900/20 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
          >
            <Database className="w-5 h-5" />
            <span className="font-medium text-sm">Merchant Database</span>
          </button>

          <button
            onClick={() => { setView('settings'); setIsSidebarOpen(false); }}
            aria-label="Settings"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              ${view === 'settings'
                ? 'bg-blue-600 shadow-lg shadow-blue-900/20 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
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
          <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-10">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open Menu"
                className="md:hidden text-slate-400 hover:text-white transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search threat logs..."
                  className="bg-slate-950 border border-slate-800 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-blue-500/50 w-64 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-emerald-400 tracking-wide">SYSTEM ONLINE</span>
              </div>

              <button aria-label="Notifications" className="relative text-slate-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
              </button>
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-slate-800 cursor-pointer">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
            <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">

              {view === 'dashboard' ? (
                <>
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
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-auto lg:h-[400px]">
                    {/* Left: Scan Area */}
                    <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-1 relative overflow-hidden group min-h-[300px]">
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

                        <div className="flex flex-wrap justify-center gap-4">
                          <button
                            onClick={() => setView('scanner')}
                            aria-label="Start Camera Scan"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/25 transition-all hover:scale-105 flex items-center gap-2"
                          >
                            <Camera className="w-4 h-4" />
                            Start Camera Scan
                          </button>
                          <button
                            onClick={() => handleSimulateScan(true)}
                            aria-label="Trigger Simulation"
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg border border-slate-700 transition-all hover:scale-105"
                          >
                            Simulate Fraud
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Recent Activity Sidebar */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[400px] lg:h-full">
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
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mt-8">
                    <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                      <h3 className="font-bold text-slate-100">Global Transaction Log</h3>
                      <button className="text-xs text-blue-400 hover:text-blue-300">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-950 text-slate-500 font-medium">
                          <tr>
                            <th className="px-6 py-3 whitespace-nowrap">Transaction ID</th>
                            <th className="px-6 py-3 whitespace-nowrap">Merchant</th>
                            <th className="px-6 py-3 whitespace-nowrap">Status</th>
                            <th className="px-6 py-3 whitespace-nowrap">Risk Score</th>
                            <th className="px-6 py-3 text-right whitespace-nowrap">Amount</th>
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
                </>
              ) : view === 'database' ? (
                // MERCHANT DATABASE VIEW
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Merchant Database</h2>
                      <p className="text-slate-400">Trusted and blacklisted entity registry.</p>
                    </div>
                    <div className="relative w-full md:w-auto">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search merchants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 w-full md:w-64 text-white"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-950 text-slate-500 font-medium">
                          <tr>
                            <th className="px-6 py-4 whitespace-nowrap">Merchant ID</th>
                            <th className="px-6 py-4 whitespace-nowrap">Entity Name</th>
                            <th className="px-6 py-4 whitespace-nowrap">Platform Trust</th>
                            <th className="px-6 py-4 whitespace-nowrap">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {filteredMerchants.map((merchant) => (
                            <tr key={merchant.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="px-6 py-4 font-mono text-xs text-slate-500">{merchant.id}</td>
                              <td className="px-6 py-4 font-bold text-slate-200">{merchant.name}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${merchant.trust > 50 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                      style={{ width: `${merchant.trust}%` }}
                                    ></div>
                                  </div>
                                  <span className="font-mono text-xs">{merchant.trust}/100</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-bold border ${merchant.status === 'Verified'
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                  : 'bg-red-500/10 text-red-500 border-red-500/20'
                                  }`}>
                                  {merchant.status === 'Verified' ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                                  {merchant.status.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {filteredMerchants.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                No merchants found matching "{searchTerm}"
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : view === 'settings' ? (
                // SETTINGS VIEW
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">System Configuration</h2>
                    <p className="text-slate-400">Manage security preferences and audit logs.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 1. Profile Section */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                      <h3 className="font-bold text-slate-100 mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-500" />
                        Admin Profile
                      </h3>

                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-slate-800 shadow-lg shadow-blue-900/20">
                          SA
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">Security Admin</h4>
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">Superuser</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between p-3 bg-slate-950 rounded-lg border border-slate-800/50">
                          <span className="text-slate-400 text-sm">Role</span>
                          <span className="text-slate-200 text-sm font-medium">Head of Security Ops</span>
                        </div>
                        <div className="flex justify-between p-3 bg-slate-950 rounded-lg border border-slate-800/50">
                          <span className="text-slate-400 text-sm">Clearance</span>
                          <span className="text-slate-200 text-sm font-medium">Level 5 (Max)</span>
                        </div>
                      </div>

                      <button className="w-full mt-6 py-2 flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>

                    {/* 2. Preferences */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
                      <h3 className="font-bold text-slate-100 mb-6 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-500" />
                        Global Preferences
                      </h3>

                      <div className="space-y-6 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-slate-200 font-medium block">Voice Alerts</span>
                            <span className="text-slate-500 text-xs">Announce threats audibly</span>
                          </div>
                          <button
                            onClick={() => setVoiceAlerts(!voiceAlerts)}
                            className={`text-2xl transition-colors ${voiceAlerts ? 'text-blue-500' : 'text-slate-600'}`}
                          >
                            {voiceAlerts ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-slate-200 font-medium block">Auto-Block Threats</span>
                            <span className="text-slate-500 text-xs">Instantly reject high-risk scores</span>
                          </div>
                          <button
                            onClick={() => setAutoBlock(!autoBlock)}
                            className={`text-2xl transition-colors ${autoBlock ? 'text-blue-500' : 'text-slate-600'}`}
                          >
                            {autoBlock ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                          </button>
                        </div>

                        <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                          <div className="space-y-0.5">
                            <span className="text-slate-200 font-medium block">API Debug Mode</span>
                            <span className="text-slate-500 text-xs">Show raw JSON responses</span>
                          </div>
                          <ToggleLeft className="w-10 h-10 text-slate-600" />
                        </div>
                      </div>
                    </div>

                    {/* 3. System Logs */}
                    <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-100 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-500" />
                          System Logs
                        </h3>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-xs font-medium border border-slate-700">
                          <Download className="w-3 h-3" />
                          Export CSV
                        </button>
                      </div>

                      <div className="bg-slate-950 rounded-xl border border-slate-800/50 p-4 font-mono text-xs text-slate-400 space-y-2 h-32 overflow-y-auto custom-scrollbar">
                        <p><span className="text-slate-600">[14:20:01]</span> <span className="text-emerald-500">SYSTEM_INIT</span>: Core modules loaded successfully.</p>
                        <p><span className="text-slate-600">[14:20:05]</span> <span className="text-blue-500">AUTH</span>: Admin session started.</p>
                        <p><span className="text-slate-600">[14:22:12]</span> <span className="text-yellow-500">WARN</span>: API latency spike detected (250ms).</p>
                        <p><span className="text-slate-600">[14:25:00]</span> <span className="text-blue-500">SCAN</span>: QR code captured. Format: UPI.</p>
                        <p><span className="text-slate-600">[14:25:01]</span> <span className="text-emerald-500">VERIFY</span>: Merchant verification pass. ID: M001.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : view === 'map' ? (
                // THREAT MAP VIEW - CONNECTED NODE NETWORK
                <div className="p-6 h-full text-white flex flex-col">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    Live Cyber-Threat Map
                  </h2>

                  {/* MAIN VISUALIZATION CONTAINER */}
                  <div className="relative w-full h-[600px] bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl flex items-center justify-center">

                    {/* 1. TECH BACKGROUND (Grid) */}
                    <div className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: 'radial-gradient(circle, #64748b 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                      }}>
                    </div>

                    {/* 2. RADAR SWEEP ANIMATION (Center) */}
                    <div className="absolute w-[500px] h-[500px] border border-slate-700/50 rounded-full flex items-center justify-center">
                      <div className="w-full h-full rounded-full border-t-2 border-green-500/50 animate-spin absolute" style={{ animationDuration: '4s' }}></div>
                      <div className="w-[300px] h-[300px] border border-slate-700/50 rounded-full"></div>
                      <div className="w-[100px] h-[100px] border border-slate-700/50 rounded-full bg-slate-800/50"></div>
                    </div>

                    {/* 3. CONNECTING LINES (SVG Overlay) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      {/* Line NY to London */}
                      <line x1="20%" y1="30%" x2="48%" y2="25%" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" className="opacity-50" />
                      {/* Line London to Mumbai */}
                      <line x1="48%" y1="25%" x2="68%" y2="45%" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" className="opacity-50" />
                      {/* Line Mumbai to Tokyo */}
                      <line x1="68%" y1="45%" x2="85%" y2="35%" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" className="opacity-50" />
                    </svg>

                    {/* --- NODE 1: NEW YORK --- */}
                    <div className="absolute top-[30%] left-[20%] group">
                      <div className="absolute -top-12 -left-12 bg-slate-900/90 border border-red-500/50 p-2 rounded shadow-lg backdrop-blur-sm">
                        <div className="text-[10px] text-slate-400 font-mono">SOURCE ORIGIN</div>
                        <div className="text-xs font-bold text-red-400">NEW YORK, USA</div>
                      </div>
                      <div className="w-4 h-4 bg-red-500 rounded-full animate-ping absolute"></div>
                      <div className="w-4 h-4 bg-red-500 rounded-full relative shadow-[0_0_15px_rgba(239,68,68,1)]"></div>
                    </div>

                    {/* --- NODE 2: LONDON --- */}
                    <div className="absolute top-[25%] left-[48%]">
                      <div className="w-3 h-3 bg-orange-500 rounded-full relative z-10 shadow-[0_0_10px_rgba(249,115,22,1)]"></div>
                      <div className="absolute top-4 left-0 text-[10px] text-orange-400 font-mono bg-slate-900/80 px-1 rounded">RELAY_NODE_01</div>
                    </div>

                    {/* --- NODE 3: MUMBAI (TARGET) --- */}
                    <div className="absolute top-[45%] left-[68%]">
                      <div className="relative">
                        <div className="absolute -inset-4 border-2 border-red-600 rounded-full animate-ping opacity-50"></div>
                        <div className="w-6 h-6 bg-red-600 rounded-full relative shadow-[0_0_30px_rgba(220,38,38,1)] z-10"></div>

                        <div className="absolute -top-16 -right-20 bg-red-950/90 border border-red-600 p-3 rounded-lg shadow-2xl z-20 animate-bounce">
                          <div className="flex items-center gap-2 mb-1">
                            <ShieldAlert className="w-4 h-4 text-red-500" />
                            <span className="font-bold text-red-500 text-sm">ACTIVE BREACH</span>
                          </div>
                          <div className="text-xs text-red-200 font-mono">MUMBAI_SERVER_04</div>
                          <div className="w-full bg-red-900/50 h-1 mt-2 rounded-full overflow-hidden">
                            <div className="bg-red-500 w-[80%] h-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* --- NODE 4: TOKYO --- */}
                    <div className="absolute top-[35%] left-[85%]">
                      <div className="w-3 h-3 bg-yellow-400/80 rounded-full animate-pulse"></div>
                      <div className="absolute top-4 right-0 text-[10px] text-yellow-400/80 font-mono">VERIFYING...</div>
                    </div>

                    {/* Live Network Feed */}
                    <div className="absolute bottom-4 right-4 text-right">
                      <div className="font-mono text-xs text-green-500 opacity-80">
                        <p>PACKET_LOSS: 0.04%</p>
                        <p>LATENCY: 42ms</p>
                        <p>ENCRYPTION: AES-256</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

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
