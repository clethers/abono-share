'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { 
  QrCode, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Plus, 
  User, 
  LogOut, 
  Image as ImageIcon,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  UsersRound,
  Settings,
  Search,
  Users,
  UserPlus,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

// --- Mock Data & Local Storage Helpers ---

const MOCK_USER = {
  uid: 'user_123',
  displayName: 'Juan dela Cruz',
  email: 'juan@example.com',
  photoURL: 'https://picsum.photos/seed/juan/200/200',
  qrCodes: {
    primary: 'https://picsum.photos/seed/qr1/400/400',
    secondary: '',
    tertiary: ''
  }
};

const MOCK_USERS = {
  'user_123': MOCK_USER,
  'recipient_456': {
    uid: 'recipient_456',
    displayName: 'Maria Santos',
    email: 'maria@example.com',
    photoURL: 'https://picsum.photos/seed/maria/200/200',
    qrCodes: { primary: 'https://picsum.photos/seed/qr2/400/400' }
  },
  'sender_789': {
    uid: 'sender_789',
    displayName: 'Jose Reyes',
    email: 'jose@example.com',
    photoURL: 'https://picsum.photos/seed/jose/200/200',
    qrCodes: { primary: 'https://picsum.photos/seed/qr3/400/400' }
  }
};

const INITIAL_TRANSACTIONS = [
  {
    id: 'tx_1',
    payerId: 'user_123',
    recipientId: 'recipient_456',
    groupId: 'group_1',
    amount: 1250.00,
    status: 'unpaid',
    category: 'food',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400 },
  },
  {
    id: 'tx_2',
    payerId: 'sender_789',
    recipientId: 'user_123',
    groupId: 'group_1',
    amount: 450.00,
    status: 'pending',
    category: 'transport',
    receiptUrl: 'https://picsum.photos/seed/receipt/800/600',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 172800 },
    paidAt: { seconds: Math.floor(Date.now() / 1000) - 170000 },
  },
  {
    id: 'tx_3',
    payerId: 'user_123',
    recipientId: 'recipient_456',
    groupId: 'group_1',
    amount: 1500.00,
    status: 'settled',
    category: 'utilities',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 259200 },
  },
  {
    id: 'tx_4',
    payerId: 'sender_789',
    recipientId: 'user_123',
    groupId: 'group_1',
    amount: 800.00,
    status: 'unpaid',
    category: 'entertainment',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 345600 },
  }
];

// --- Components ---

const StatusBadge = ({ status }) => {
  const configs = {
    unpaid: { color: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20', label: 'Unpaid' },
    pending: { color: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20', label: 'Pending Verification' },
    settled: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20', label: 'Settled' },
  };
  const config = configs[status] || configs.unpaid;

  return (
    <span className={`inline-flex items-center justify-center min-w-[80px] px-2 py-0.5 rounded-[4px] border text-[9px] font-black uppercase tracking-widest ${config.color}`}>
      {config.label}
    </span>
  );
};

const CategoryTag = ({ category }) => {
  const categories = {
    food: { label: 'Food & Dining', style: 'bg-[var(--tag-food-bg)] text-[var(--tag-food-text)]' },
    transport: { label: 'Transport', style: 'bg-[var(--tag-transport-bg)] text-[var(--tag-transport-text)]' },
    utilities: { label: 'Utilities', style: 'bg-[var(--tag-utilities-bg)] text-[var(--tag-utilities-text)]' },
    entertainment: { label: 'Entertainment', style: 'bg-[var(--tag-entertainment-bg)] text-[var(--tag-entertainment-text)]' },
    others: { label: 'Others', style: 'bg-[var(--tag-others-bg)] text-[var(--tag-others-text)]' },
  };

  const config = categories[category] || categories.others;

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tighter ${config.style}`}>
      {config.label}
    </span>
  );
};

const RegistrationQrUpload = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback(acceptedFiles => {
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    
    // Trigger upload immediately
    setUploading(true);
    setTimeout(() => {
      const mockUrl = `https://picsum.photos/seed/qr_${Date.now()}/400/400`;
      onUpload(mockUrl);
      setUploading(false);
    }, 1000);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    multiple: false 
  });

  return (
    <div 
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all bg-bg-main/50 min-h-[140px] flex items-center justify-center relative overflow-hidden group ${
        isDragActive ? 'border-brand bg-brand/5' : 'border-border-theme hover:border-brand/50'
      }`}
    >
      <input {...getInputProps()} />
      {preview ? (
        <div className="relative w-full h-full flex flex-col items-center gap-2">
          <div className="w-20 h-20 relative rounded-lg overflow-hidden border border-border-theme">
            <Image src={preview} alt="QR Preview" fill className="object-cover" />
          </div>
          <p className="text-[10px] font-bold text-brand uppercase tracking-widest">
            {uploading ? 'Processing...' : 'QR Captured'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <QrCode size={24} className="text-ink-secondary group-hover:text-brand transition-colors" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-ink-primary">Upload Payment QR</p>
            <p className="text-[10px] text-ink-secondary">GCash, Maya, or Bank QR</p>
          </div>
        </div>
      )}
    </div>
  );
};

const ReceiptUpload = ({ onUpload, onCancel }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(acceptedFiles => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    multiple: false 
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      const mockUrl = `https://picsum.photos/seed/${Date.now()}/800/600`;
      onUpload(mockUrl);
      setUploading(false);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors bg-[#FAFAFB] min-h-[180px] flex items-center justify-center ${
          isDragActive ? 'border-brand' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="text-3xl text-[#6C727A]">
            &#8682;
          </div>
          {file ? (
            <p className="text-sm font-semibold text-[#1A1C1E]">{file.name}</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-[#6C727A]">Upload screenshot of receipt</p>
              <p className="text-xs text-[#94A3B8]">Drag and drop or click to select image</p>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-[11px] font-bold uppercase text-[#94A3B8] tracking-wider">Verification Requirements</div>
        <ul className="text-xs text-[#6C727A] space-y-1">
          <li>• Must show total amount</li>
          <li>• Must show recipient name</li>
          <li>• Reference number visible</li>
        </ul>
      </div>

      <div className="flex gap-3 pt-4">
        <button 
          onClick={onCancel}
          className="flex-1 px-4 py-3 text-sm font-bold text-[#6C727A] bg-[#F4F7F9] rounded-lg hover:bg-[#E2E8F0] transition-colors"
        >
          Cancel
        </button>
        <button 
          disabled={!file || uploading}
          onClick={handleUpload}
          className="flex-1 px-4 py-3 text-sm font-bold text-white bg-brand rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Confirm Payment'}
        </button>
      </div>
    </div>
  );
};

const MOCK_GROUPS = [
  {
    id: 'group_1',
    name: 'BGC Foodies',
    members: ['user_123', 'recipient_456', 'sender_789'],
    totalSpent: 4500.00,
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 604800 }
  },
  {
    id: 'group_2',
    name: 'Weekend Trip',
    members: ['user_123', 'recipient_456'],
    totalSpent: 12000.00,
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 259200 }
  }
];

// --- Main App ---

export default function AbonoShareApp() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('abonoshare_user');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [transactions, setTransactions] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('abonoshare_txs');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    }
    return INITIAL_TRANSACTIONS;
  });
  const [allUsers, setAllUsers] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('abonoshare_all_users');
      return saved ? JSON.parse(saved) : MOCK_USERS;
    }
    return MOCK_USERS;
  });
  const [groups, setGroups] = useState(MOCK_GROUPS);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('active'); // active, dashboard, settle-up, detail, add-bill, groups
  const [selectedTx, setSelectedTx] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [settleStep, setSettleStep] = useState('qr'); // qr, upload

  // Form State for New Bill
  const [newBillAmount, setNewBillAmount] = useState('');
  const [newBillRecipient, setNewBillRecipient] = useState('');
  const [newBillDescription, setNewBillDescription] = useState('');
  const [newBillGroupId, setNewBillGroupId] = useState('');
  const [newBillCategory, setNewBillCategory] = useState('food');

  // Form State for New Group
  const [newGroupName, setNewGroupName] = useState('');
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberId, setNewMemberId] = useState('');
  const [viewingProfile, setViewingProfile] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [registrationData, setRegistrationData] = useState({ displayName: '', mobile: '', email: '' });
  const [registrationQrUrl, setRegistrationQrUrl] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('abonoshare_dark_mode');
      return saved === 'true';
    }
    return false;
  });

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('abonoshare_dark_mode', darkMode);
  }, [darkMode]);

  // Load data from localStorage on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (mounted) {
      if (user) {
        localStorage.setItem('abonoshare_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('abonoshare_user');
      }
      localStorage.setItem('abonoshare_txs', JSON.stringify(transactions));
      localStorage.setItem('abonoshare_all_users', JSON.stringify(allUsers));
    }
  }, [user, transactions, allUsers, mounted]);

  const handleLogin = () => {
    setUser(MOCK_USER);
    setAllUsers(prev => ({ ...prev, [MOCK_USER.uid]: MOCK_USER }));
  };

  const handleRegister = (userData) => {
    const newUser = {
      uid: `user_${Date.now()}`,
      displayName: userData.displayName,
      email: userData.email || '',
      mobile: userData.mobile ? `+63${userData.mobile}` : '',
      photoURL: `https://picsum.photos/seed/${userData.displayName}/200/200`,
      qrCodes: {
        primary: userData.qrCodeUrl,
        secondary: '',
        tertiary: ''
      }
    };
    setUser(newUser);
    setAllUsers(prev => ({ ...prev, [newUser.uid]: newUser }));
    setIsRegistering(false);
    setRegistrationStep(1);
    setRegistrationData({ displayName: '', mobile: '', email: '' });
    setRegistrationQrUrl('');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('abonoshare_user');
  };

  const handleSettleUp = (tx) => {
    setSelectedTx(tx);
    setSettleStep('qr');
    setActiveView('settle-up');
  };

  const handleUploadReceipt = (url) => {
    const updatedTxs = transactions.map(t => 
      t.id === selectedTx.id 
        ? { ...t, status: 'pending', receiptUrl: url, paidAt: { seconds: Math.floor(Date.now() / 1000) } }
        : t
    );
    setTransactions(updatedTxs);
    setActiveView('dashboard');
    setSelectedTx(null);
  };

  const handleVerifyPayment = (txId) => {
    const updatedTxs = transactions.map(t => 
      t.id === txId 
        ? { ...t, status: 'settled', verifiedAt: { seconds: Math.floor(Date.now() / 1000) } }
        : t
    );
    setTransactions(updatedTxs);
    setActiveView('dashboard');
    setSelectedTx(null);
  };

  const handleCreateBill = (e) => {
    e.preventDefault();
    if (!newBillAmount || !newBillRecipient) return;

    const newTx = {
      id: `tx_${Date.now()}`,
      payerId: user.uid,
      recipientId: newBillRecipient,
      groupId: newBillGroupId || null,
      description: newBillDescription || 'Split Bill',
      amount: parseFloat(newBillAmount),
      status: 'unpaid',
      category: newBillCategory,
      createdAt: { seconds: Math.floor(Date.now() / 1000) }
    };
    
    setTransactions([newTx, ...transactions]);
    setNewBillAmount('');
    setNewBillRecipient('');
    setNewBillDescription('');
    setNewBillGroupId('');
    setNewBillCategory('food');
    setActiveView('active');
  };

  const createNewBill = () => {
    setActiveView('add-bill');
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName) return;
    const newGroup = {
      id: `group_${Date.now()}`,
      name: newGroupName,
      members: [user.uid],
      totalSpent: 0,
      createdAt: { seconds: Math.floor(Date.now() / 1000) }
    };
    setGroups([newGroup, ...groups]);
    setNewGroupName('');
    setIsAddingGroup(false);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberId || !selectedGroup) return;
    
    const updatedGroups = groups.map(g => 
      g.id === selectedGroup.id 
        ? { ...g, members: [...new Set([...g.members, newMemberId])] }
        : g
    );
    
    setGroups(updatedGroups);
    setSelectedGroup({ ...selectedGroup, members: [...new Set([...selectedGroup.members, newMemberId])] });
    setNewMemberId('');
    setIsAddingMember(false);
  };

  const handleRemoveMember = (memberId) => {
    if (!selectedGroup) return;
    const updatedGroups = groups.map(g => 
      g.id === selectedGroup.id 
        ? { ...g, members: g.members.filter(m => m !== memberId) }
        : g
    );
    setGroups(updatedGroups);
    setSelectedGroup({ ...selectedGroup, members: selectedGroup.members.filter(m => m !== memberId) });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  if (!user) {
    if (isRegistering) {
      return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-bg-main px-5 py-10 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={() => {
                  if (registrationStep === 2) {
                    setRegistrationStep(1);
                  } else {
                    setIsRegistering(false);
                    setRegistrationStep(1);
                    setRegistrationData({ displayName: '', mobile: '', email: '' });
                    setRegistrationQrUrl('');
                  }
                }}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface border border-border-theme text-ink-secondary hover:text-ink-primary transition-colors"
              >
                <ArrowRight className="rotate-180" size={18} />
              </button>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
                    Step {registrationStep} of 2
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
                    {registrationStep === 1 ? 'Identity' : 'Payment Setup'}
                  </span>
                </div>
                <div className="h-1.5 bg-border-theme rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-brand rounded-full"
                    initial={{ width: registrationStep === 1 ? '0%' : '50%' }}
                    animate={{ width: registrationStep === 1 ? '50%' : '100%' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {registrationStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="bg-surface rounded-3xl border border-border-theme shadow-xl p-6 sm:p-8 space-y-6">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-ink-primary">Who are you?</h2>
                      <p className="text-sm text-ink-secondary">This is how others will find and pay you.</p>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(e.target);
                        setRegistrationData({
                          displayName: fd.get('displayName'),
                          mobile: fd.get('mobile'),
                          email: fd.get('email'),
                        });
                        setRegistrationStep(2);
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">Full Name</label>
                        <input
                          name="displayName"
                          type="text"
                          required
                          defaultValue={registrationData.displayName}
                          placeholder="e.g. Juan dela Cruz"
                          className="w-full px-4 py-3 bg-bg-main border border-border-theme rounded-xl focus:outline-none focus:border-brand transition-all text-sm font-medium text-ink-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
                          Mobile Number <span className="text-brand">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-ink-secondary">+63</span>
                          <input
                            name="mobile"
                            type="tel"
                            required
                            defaultValue={registrationData.mobile}
                            placeholder="9XX XXX XXXX"
                            maxLength={10}
                            className="w-full pl-12 pr-4 py-3 bg-bg-main border border-border-theme rounded-xl focus:outline-none focus:border-brand transition-all text-sm font-medium text-ink-primary"
                          />
                        </div>
                        <p className="text-[10px] text-ink-secondary">Used to find you on GCash, Maya, and for bill requests.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
                          Email <span className="text-ink-secondary font-medium normal-case tracking-normal">(optional)</span>
                        </label>
                        <input
                          name="email"
                          type="email"
                          defaultValue={registrationData.email}
                          placeholder="juan@example.com"
                          className="w-full px-4 py-3 bg-bg-main border border-border-theme rounded-xl focus:outline-none focus:border-brand transition-all text-sm font-medium text-ink-primary"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full py-4 bg-brand text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-brand/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          Continue
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {registrationStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="bg-surface rounded-3xl border border-border-theme shadow-xl p-6 sm:p-8 space-y-6">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-ink-primary">Set up payment</h2>
                      <p className="text-sm text-ink-secondary">Upload your GCash, Maya, or bank QR so others can pay you directly.</p>
                    </div>

                    <div className="p-4 bg-brand/5 border border-brand/20 rounded-2xl flex gap-3 items-start">
                      <ShieldCheck size={16} className="text-brand shrink-0 mt-0.5" />
                      <p className="text-xs text-brand font-medium leading-relaxed">
                        Your QR code is stored locally on your device. It is never uploaded to any external server.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
                        Primary Payment QR <span className="text-brand">*</span>
                      </label>
                      <RegistrationQrUpload onUpload={(url) => setRegistrationQrUrl(url)} />
                    </div>

                    <div className="space-y-3 pt-2">
                      <button
                        type="button"
                        disabled={!registrationQrUrl}
                        onClick={() => {
                          if (!registrationQrUrl) return;
                          handleRegister({ ...registrationData, qrCodeUrl: registrationQrUrl });
                        }}
                        className="w-full py-4 bg-brand text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-brand/20 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={18} />
                        Complete Registration
                      </button>
                      <p className="text-center text-[10px] text-ink-secondary">
                        You can update or add more QR codes later in Settings.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-bg-main px-5 py-10 safe-top">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand text-white rounded-2xl shadow-lg mb-4">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-ink-primary">AbonoShare</h1>
            <p className="text-ink-secondary">High-trust bill splitting with receipt verification.</p>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-surface border border-border-theme rounded-2xl shadow-sm hover:bg-bg-main transition-all font-bold text-ink-primary"
            >
              <User size={20} className="text-brand" />
              Sign in to Demo
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-theme"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-bg-main px-2 text-ink-secondary font-bold tracking-widest">Or</span>
              </div>
            </div>

            <button 
              onClick={() => setIsRegistering(true)}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-brand text-white rounded-2xl shadow-lg shadow-brand/20 hover:scale-[1.02] transition-all font-bold"
            >
              <UserPlus size={20} />
              Create New Account
            </button>
          </div>
          
          <p className="text-[10px] text-ink-secondary font-bold uppercase tracking-widest">Note: This is a local demo. Data is saved to your browser.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell flex flex-col bg-bg-main font-sans text-ink-primary transition-colors duration-300">
      {/* Header */}
      <header className="header-safe shrink-0 glass border-b border-border-theme px-4 sm:px-6 flex items-center justify-between z-30 min-h-[52px]">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tighter">
          <div className="w-5 h-5 bg-brand rounded-[4px]" />
          AbonoShare
        </div>
        <div className="flex items-center gap-2 text-[12px] font-medium">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-9 h-9 flex items-center justify-center text-ink-secondary hover:text-ink-primary transition-all bg-surface/50 rounded-lg border border-border-theme"
            aria-label="Toggle Dark Mode"
          >
            <motion.div
              initial={false}
              animate={{ rotate: darkMode ? 0 : 180, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              {darkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-brand" />}
            </motion.div>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="max-w-[100px] sm:max-w-none truncate text-ink-primary font-bold">{user.displayName.split(' ')[0]}</span>
            <button
              onClick={handleLogout}
              className="w-9 h-9 flex items-center justify-center text-ink-secondary hover:text-ink-primary transition-colors"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Summary Bar */}
      <AnimatePresence>
        {activeView === 'settle-up' && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass bg-brand text-white px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center overflow-hidden border-t-0 border-x-0 shadow-lg"
          >
            {selectedTx && (
              <>
                <div>
                  <div className="text-[9px] sm:text-[10px] uppercase tracking-[1.5px] opacity-70 font-bold mb-0.5">Settlement</div>
                  <div className="text-2xl sm:text-3xl font-semibold">₱{selectedTx.amount.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] sm:text-[10px] uppercase tracking-[1.5px] opacity-70 font-bold mb-0.5">Recipient</div>
                  <div className="text-base sm:text-lg truncate max-w-[120px]">{selectedTx.recipientId === user.uid ? 'You' : selectedTx.recipientId.slice(0, 8) + '...'}</div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-6 pt-0 pb-0 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Navigation Rail */}
        <nav className="hidden md:flex flex-col gap-2 w-52 shrink-0 overflow-y-auto px-3 py-2 custom-scrollbar">
          <button 
            onClick={createNewBill}
            className="mb-6 w-full py-4 bg-brand text-white rounded-2xl font-bold text-sm shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_20px_30px_-10px_rgba(37,99,235,0.5)] hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/10"
          >
            <Plus size={18} strokeWidth={3} />
            New Request
          </button>
          
          <button 
            onClick={() => setActiveView('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeView === 'dashboard' ? (darkMode ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-white text-brand shadow-sm border border-border-theme') : 'text-ink-secondary hover:bg-surface hover:text-ink-primary'}`}
          >
            <CreditCard size={18} />
            Ledger
          </button>
          <button 
            onClick={() => setActiveView('active')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeView === 'active' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-ink-secondary hover:bg-surface hover:text-ink-primary'}`}
          >
            <Clock size={18} />
            Active
          </button>
          <button 
            onClick={() => setActiveView('groups')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeView === 'groups' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-ink-secondary hover:bg-surface hover:text-ink-primary'}`}
          >
            <UsersRound size={18} />
            Groups
          </button>
          <div className="mt-auto pt-4 border-t border-border-theme">
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-ink-secondary hover:bg-surface hover:text-ink-primary transition-all w-full">
              <Settings size={18} />
              Settings
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-border-theme px-2 pt-2 bottom-nav-safe flex justify-around items-center z-40">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[64px] transition-colors ${activeView === 'dashboard' ? 'text-brand' : 'text-ink-secondary'}`}
          >
            <CreditCard size={22} />
            <span className="text-[10px] font-bold uppercase tracking-wide">Ledger</span>
          </button>
          <button
            onClick={() => setActiveView('active')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[64px] transition-colors ${activeView === 'active' ? 'text-brand' : 'text-ink-secondary'}`}
          >
            <Clock size={22} />
            <span className="text-[10px] font-bold uppercase tracking-wide">Active</span>
          </button>
          <button
            onClick={() => setActiveView('groups')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[64px] transition-colors ${activeView === 'groups' ? 'text-brand' : 'text-ink-secondary'}`}
          >
            <UsersRound size={22} />
            <span className="text-[10px] font-bold uppercase tracking-wide">Groups</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[64px] text-ink-secondary">
            <Settings size={22} />
            <span className="text-[10px] font-bold uppercase tracking-wide">Settings</span>
          </button>
        </nav>

        <div className="flex-1 h-full overflow-y-auto overflow-x-hidden scroll-container pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-8 pr-1 md:py-4">
          <AnimatePresence mode="wait">
            {activeView === 'active' && (
              <motion.div 
                key="active"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="card-theme p-4 sm:p-6 glass border-l-4 border-l-brand">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-brand/10 text-brand rounded-lg">
                        <Clock size={16} />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">Pending Total</p>
                    </div>
                    <p className="text-3xl font-black text-ink-primary">
                      ₱{transactions.filter(tx => tx.status !== 'settled').reduce((acc, tx) => acc + tx.amount, 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="card-theme p-4 sm:p-6 glass border-l-4 border-l-amber-400">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                        <AlertCircle size={16} />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">Active Requests</p>
                    </div>
                    <p className="text-3xl font-black text-ink-primary">
                      {transactions.filter(tx => tx.status !== 'settled').length}
                    </p>
                  </div>
                  <div className="card-theme p-4 sm:p-6 glass border-l-4 border-l-emerald-500">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <CheckCircle2 size={16} />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">To Receive</p>
                    </div>
                    <p className="text-3xl font-black text-ink-primary">
                      ₱{transactions.filter(tx => tx.status !== 'settled' && tx.recipientId === user.uid).reduce((acc, tx) => acc + tx.amount, 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <section className="card-theme glass overflow-hidden">
                  <div className="card-header-theme">Active Transactions</div>
                  <div className="divide-y divide-border-theme">
                    {transactions.filter(tx => tx.status !== 'settled').length === 0 ? (
                      <div className="p-12 text-center space-y-3">
                        <div className="inline-flex p-4 bg-[#F4F7F9]/50 rounded-full text-[#CBD5E1]">
                          <Clock size={32} />
                        </div>
                        <p className="text-ink-secondary text-sm">No active transactions.</p>
                      </div>
                    ) : (
                      transactions.filter(tx => tx.status !== 'settled').map((tx) => (
                        <div 
                          key={tx.id}
                          onClick={() => { setSelectedTx(tx); setActiveView('detail'); }}
                          className="p-4 flex items-center justify-between hover:bg-[#F4F7F9]/50 cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.recipientId === user.uid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              {tx.recipientId === user.uid ? <Plus size={18} /> : <ArrowRight size={18} className="rotate-180" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-sm font-bold text-ink-primary">
                                  {tx.recipientId === user.uid ? `From ${allUsers[tx.payerId]?.displayName || tx.payerId.slice(0, 8)}` : `To ${allUsers[tx.recipientId]?.displayName || tx.recipientId.slice(0, 8)}`}
                                </p>
                                {tx.category && <CategoryTag category={tx.category} />}
                              </div>
                              <p className="text-[10px] text-ink-secondary font-medium">
                                {new Date(tx.createdAt.seconds * 1000).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-ink-primary">₱{tx.amount.toFixed(2)}</p>
                            <StatusBadge status={tx.status} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </motion.div>
            )}

            {activeView === 'dashboard' && (
              <motion.div 
                key="dashboard"
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Top Row: User Summary & Payment Slots */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* User Summary Card */}
                  <section className="card-theme glass p-5 sm:p-6 flex flex-col justify-between min-h-[130px] sm:min-h-[160px]">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">Your Balance</p>
                      <p className="text-3xl font-black text-ink-primary">
                        ₱{transactions.reduce((acc, tx) => {
                          if (tx.status === 'settled') return acc;
                          return tx.recipientId === user.uid ? acc + tx.amount : acc - tx.amount;
                        }, 0).toFixed(2)}
                      </p>
                    </div>
                  </section>

                  {/* Payment Slots - Now more compact */}
                  <section className="card-theme lg:col-span-2 glass">
                    <div className="card-header-theme py-3 px-6 border-b border-border-theme flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest">Quick Payment Slots</span>
                      <button className="text-[10px] font-bold text-brand uppercase tracking-widest hover:underline">Manage</button>
                    </div>
                    <div className="p-4 grid grid-cols-3 gap-3">
                      {['Primary', 'Secondary', 'Tertiary'].map((label, i) => (
                        <div key={label} className="slot-item flex flex-col items-center justify-center gap-2 p-3 rounded-xl border group cursor-pointer hover:border-brand transition-all">
                          <QrCode size={20} className={i === 0 ? "text-brand" : "text-ink-secondary group-hover:text-brand transition-colors"} />
                          <span className="text-[9px] font-bold uppercase tracking-tighter text-ink-secondary group-hover:text-ink-primary">{label}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Main Ledger - Full Width */}
                <section className="card-theme glass overflow-hidden">
                  <div className="card-header-theme">Settlement Ledger</div>
                  <div className="divide-y divide-border-theme">
                    {transactions.length === 0 ? (
                      <div className="p-12 text-center space-y-3">
                        <div className="inline-flex p-4 bg-[#F4F7F9]/50 rounded-full text-[#CBD5E1]">
                          <CreditCard size={32} />
                        </div>
                        <p className="text-ink-secondary text-sm">No settlements found.</p>
                      </div>
                    ) : (
                      transactions.map((tx) => (
                        <div 
                          key={tx.id}
                          onClick={() => { setSelectedTx(tx); setActiveView('detail'); }}
                          className="p-4 flex items-center justify-between hover:bg-[#F4F7F9]/50 cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.payerId === user.uid ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {tx.payerId === user.uid ? <ArrowRight className="rotate-45" size={18} /> : <ArrowRight className="-rotate-135" size={18} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="font-bold text-sm text-ink-primary">
                                  {tx.payerId === user.uid ? `To ${allUsers[tx.recipientId]?.displayName || tx.recipientId.slice(0, 8)}` : `From ${allUsers[tx.payerId]?.displayName || tx.payerId.slice(0, 8)}`}
                                </p>
                                {tx.category && <CategoryTag category={tx.category} />}
                              </div>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={tx.status} />
                                <span className="text-[10px] text-ink-secondary font-medium">
                                  {tx.groupId ? `• ${groups.find(g => g.id === tx.groupId)?.name}` : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-ink-primary">₱{tx.amount.toFixed(2)}</p>
                            <p className="text-[10px] text-ink-secondary uppercase font-bold tracking-widest">
                              {new Date(tx.createdAt?.seconds * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </motion.div>
            )}

          {activeView === 'group-detail' && selectedGroup && (
            <motion.div 
              key="group-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveView('groups')}
                  className="p-2 hover:bg-white rounded-xl transition-all text-ink-secondary hover:text-ink-primary"
                >
                  <ArrowRight className="rotate-180" size={20} />
                </button>
                <div>
                  <h2 className="text-2xl font-black text-ink-primary">{selectedGroup.name}</h2>
                  <p className="text-xs text-ink-secondary font-bold uppercase tracking-widest mt-1">Group Management</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Members Section */}
                <section className="card-theme lg:col-span-1 h-fit order-2 lg:order-1">
                  <div className="card-header-theme flex justify-between items-center">
                    <span>Members</span>
                    <button 
                      onClick={() => setIsAddingMember(true)}
                      className="text-brand hover:underline text-[10px] font-bold uppercase tracking-widest"
                    >
                      + Add Member
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    {selectedGroup.members.map(memberId => {
                      const memberData = allUsers[memberId] || { uid: memberId, displayName: memberId };
                      return (
                        <div 
                          key={memberId} 
                          className="flex items-center justify-between p-3 bg-[#F8FAFC]/50 rounded-xl border border-border-theme group/member hover:border-brand transition-all cursor-pointer"
                          onClick={() => setViewingProfile(memberData)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center text-[10px] font-bold overflow-hidden">
                              {memberData.photoURL ? (
                                <Image src={memberData.photoURL} alt="" width={32} height={32} className="object-cover" />
                              ) : (
                                memberId.slice(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-ink-primary truncate max-w-[120px]">
                                {memberId === user.uid ? 'You' : memberData.displayName}
                              </p>
                              <p className="text-[10px] text-ink-secondary font-medium">View Profile</p>
                            </div>
                          </div>
                          {memberId !== user.uid && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleRemoveMember(memberId); }}
                              className="opacity-0 group-hover/member:opacity-100 p-1 text-ink-secondary hover:text-red-500 transition-all"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Group Ledger */}
                <section className="card-theme lg:col-span-2 glass order-1 lg:order-2">
                  <div className="card-header-theme">Group Ledger</div>
                  <div className="divide-y divide-border-theme">
                    {transactions.filter(tx => tx.groupId === selectedGroup.id).length === 0 ? (
                      <div className="p-12 text-center space-y-3">
                        <div className="inline-flex p-4 bg-[#F4F7F9]/50 rounded-full text-[#CBD5E1]">
                          <CreditCard size={32} />
                        </div>
                        <p className="text-ink-secondary text-sm">No group transactions yet.</p>
                      </div>
                    ) : (
                      transactions.filter(tx => tx.groupId === selectedGroup.id).map((tx) => (
                        <div 
                          key={tx.id}
                          onClick={() => { setSelectedTx(tx); setActiveView('detail'); }}
                          className="p-4 flex items-center justify-between hover:bg-[#F4F7F9]/50 cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.payerId === user.uid ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {tx.payerId === user.uid ? <ArrowRight className="rotate-45" size={18} /> : <ArrowRight className="-rotate-135" size={18} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="font-bold text-sm text-ink-primary">
                                  {tx.payerId === user.uid ? `To ${allUsers[tx.recipientId]?.displayName || tx.recipientId.slice(0, 8)}` : `From ${allUsers[tx.payerId]?.displayName || tx.payerId.slice(0, 8)}`}
                                </p>
                                {tx.category && <CategoryTag category={tx.category} />}
                              </div>
                              <StatusBadge status={tx.status} />
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-ink-primary">₱{tx.amount.toFixed(2)}</p>
                            <p className="text-[10px] text-ink-secondary uppercase font-bold tracking-widest">
                              {new Date(tx.createdAt?.seconds * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>

              {/* Profile View Modal */}
              <AnimatePresence>
                {viewingProfile && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setViewingProfile(null)}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: 20 }}
                      className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden mx-2"
                    >
                      <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-brand/10 overflow-hidden border border-brand/20">
                              {viewingProfile.photoURL ? (
                                <Image src={viewingProfile.photoURL} alt="" width={64} height={64} className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-brand font-black text-xl">
                                  {viewingProfile.displayName.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-ink-primary">{viewingProfile.displayName}</h3>
                              <p className="text-xs text-ink-secondary font-bold uppercase tracking-widest">Member Profile</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setViewingProfile(null)}
                            className="p-2 bg-gray-100 rounded-full text-ink-secondary hover:text-ink-primary transition-colors"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border-theme">
                          {viewingProfile.mobile && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">Mobile</p>
                              <p className="text-sm font-bold text-ink-primary">{viewingProfile.mobile}</p>
                            </div>
                          )}
                          {viewingProfile.email && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">Email</p>
                              <p className="text-sm font-medium text-ink-primary">{viewingProfile.email}</p>
                            </div>
                          )}
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">User ID</p>
                            <p className="text-sm font-mono font-bold text-brand">{viewingProfile.uid}</p>
                          </div>
                        </div>

                        <div className="bg-[#F8FAFC] rounded-3xl p-6 text-center space-y-4 border border-border-theme">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">Payment QR Code</p>
                          <div className="w-40 h-40 mx-auto bg-white border-4 border-ink-primary p-2 relative shadow-inner">
                            {viewingProfile.qrCodes?.primary ? (
                              <Image 
                                src={viewingProfile.qrCodes.primary} 
                                alt="QR Code" 
                                width={160} 
                                height={160} 
                                className="object-contain"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
                                <QrCode size={40} />
                                <span className="text-[8px] font-bold uppercase">No QR Set</span>
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-ink-secondary leading-relaxed">
                            Scan this code to pay {viewingProfile.displayName.split(' ')[0]} directly.
                          </p>
                        </div>

                        <button 
                          onClick={() => setViewingProfile(null)}
                          className="w-full py-4 bg-ink-primary text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all"
                        >
                          Close Profile
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Add Member Modal */}
              <AnimatePresence>
                {isAddingMember && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsAddingMember(false)}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-8 mx-2"
                    >
                      <div className="flex items-center gap-3 mb-5 sm:mb-6">
                        <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                          <UserPlus size={20} />
                        </div>
                        <h3 className="text-xl font-black text-ink-primary">Add Member</h3>
                      </div>
                      <form onSubmit={handleAddMember} className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">User ID / Email</label>
                          <input 
                            type="text" 
                            required
                            autoFocus
                            value={newMemberId}
                            onChange={(e) => setNewMemberId(e.target.value)}
                            placeholder="e.g. user_456"
                            className="w-full px-4 py-3 bg-[#F8FAFC]/50 border border-border-theme rounded-xl focus:outline-none focus:border-brand transition-all text-sm font-medium"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button 
                            type="button"
                            onClick={() => setIsAddingMember(false)}
                            className="flex-1 py-3 text-sm font-bold text-ink-secondary hover:bg-gray-50 rounded-xl transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            className="flex-1 py-3 bg-brand text-white rounded-xl font-bold text-sm shadow-lg shadow-brand/20"
                          >
                            Add to Group
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

            </motion.div>
          )}

          {activeView === 'groups' && (
            <motion.div 
              key="groups"
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-ink-primary">Groups</h2>
                  <p className="text-xs text-ink-secondary font-bold uppercase tracking-widest mt-1">Manage shared expenses</p>
                </div>
                <button 
                  onClick={() => setIsAddingGroup(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl font-bold text-sm shadow-lg shadow-brand/10 hover:scale-105 transition-transform"
                >
                  <Plus size={16} />
                  New Group
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="card-theme p-4 sm:p-6 glass">
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">Groups</p>
                  <p className="text-xl sm:text-2xl font-black text-ink-primary">{groups.length}</p>
                </div>
                <div className="card-theme p-4 sm:p-6 glass">
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">Members</p>
                  <p className="text-xl sm:text-2xl font-black text-ink-primary">
                    {new Set(groups.flatMap(g => g.members)).size}
                  </p>
                </div>
                <div className="card-theme p-4 sm:p-6 glass">
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">Volume</p>
                  <p className="text-xl sm:text-2xl font-black text-brand truncate">₱{groups.reduce((acc, g) => acc + g.totalSpent, 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map(group => (
                  <motion.div 
                    key={group.id}
                    whileHover={{ y: -4 }}
                    onClick={() => { setSelectedGroup(group); setActiveView('group-detail'); }}
                    className="card-theme group cursor-pointer glass"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
                          <Users size={24} />
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">Total Spent</p>
                          <p className="text-lg font-black text-ink-primary">₱{group.totalSpent.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-bold text-ink-primary">{group.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex -space-x-2">
                            {group.members.slice(0, 3).map((m, i) => (
                              <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[8px] font-bold">
                                {m.slice(0, 1).toUpperCase()}
                              </div>
                            ))}
                            {group.members.length > 3 && (
                              <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-ink-secondary">
                                +{group.members.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-ink-secondary font-medium">{group.members.length} members</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border-theme flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
                          Created {new Date(group.createdAt.seconds * 1000).toLocaleDateString()}
                        </span>
                        <ChevronRight size={16} className="text-ink-secondary group-hover:text-brand transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add Group Modal */}
              <AnimatePresence>
                {isAddingGroup && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsAddingGroup(false)}
                      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="relative w-full max-w-sm glass rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-8 mx-2"
                    >
                      <h3 className="text-xl font-black text-ink-primary mb-5 sm:mb-6">Create New Group</h3>
                      <form onSubmit={handleCreateGroup} className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">Group Name</label>
                          <input 
                            type="text" 
                            required
                            autoFocus
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="e.g. Household Expenses"
                            className="w-full px-4 py-3 bg-[#F8FAFC]/50 border border-border-theme rounded-xl focus:outline-none focus:border-brand transition-all text-sm font-medium"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button 
                            type="button"
                            onClick={() => setIsAddingGroup(false)}
                            className="flex-1 py-3 text-sm font-bold text-ink-secondary hover:bg-gray-50 rounded-xl transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            className="flex-1 py-3 bg-brand text-white rounded-xl font-bold text-sm shadow-lg shadow-brand/20"
                          >
                            Create
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeView === 'settle-up' && (
            <motion.div 
              key="settle-up"
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
            >
              <section className="card-theme glass">
                <div className="card-header-theme">Step 1: Settle Up</div>
                <div className="p-6 sm:p-8 text-center space-y-6">
                  <span className="inline-block px-3 py-1 bg-[#EFF6FF]/50 text-brand rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">Primary QR (Zelle)</span>
                  <div className="w-36 h-36 sm:w-48 sm:h-48 mx-auto border-8 border-ink-primary bg-white flex items-center justify-center relative shadow-lg">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%)', backgroundSize: '16px 16px' }} />
                    <QrCode size={56} className="text-ink-primary relative z-10" />
                  </div>
                  <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed max-w-[240px] mx-auto">
                    Scan this code in your banking app to complete the external transfer.
                  </p>
                  {settleStep === 'qr' && (
                    <button 
                      onClick={() => setSettleStep('upload')}
                      className="w-full py-4 bg-brand text-white rounded-lg font-bold hover:opacity-90 transition-all shadow-lg shadow-brand/20 active:scale-[0.98]"
                    >
                      I&apos;ve Paid the Recipient
                    </button>
                  )}
                </div>
              </section>

              <section className="card-theme glass">
                <div className="card-header-theme">Step 2: Mandatory Proof</div>
                <div className="p-4 sm:p-6 h-full flex flex-col">
                  {settleStep === 'upload' ? (
                    <ReceiptUpload 
                      onUpload={handleUploadReceipt} 
                      onCancel={() => setSettleStep('qr')} 
                    />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-40 grayscale min-h-[200px]">
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <Upload size={28} />
                      </div>
                      <p className="text-xs sm:text-sm font-medium">Complete Step 1 to unlock upload</p>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {activeView === 'detail' && selectedTx && (
            <motion.div 
              key="detail"
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              <div className="flex items-center justify-between mb-2">
                <button 
                  onClick={() => setActiveView('dashboard')}
                  className="flex items-center gap-2 text-xs font-bold text-ink-secondary hover:text-brand transition-colors"
                >
                  <ArrowRight className="rotate-180" size={16} />
                  Back to Ledger
                </button>
                <div className="flex gap-2 items-center">
                  {selectedTx.category && <CategoryTag category={selectedTx.category} />}
                  <StatusBadge status={selectedTx.status} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Main Detail Card */}
                <section className="card-theme lg:col-span-2 glass overflow-hidden">
                  <div className="card-header-theme">Transaction Detail</div>
                  <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">
                    <div className="flex justify-between items-end gap-4">
                      <div className="space-y-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">Settlement Amount</p>
                        <p className="text-3xl sm:text-5xl font-black text-ink-primary tracking-tight truncate">₱{selectedTx.amount.toFixed(2)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">Reference ID</p>
                        <p className="text-xs sm:text-sm font-mono font-bold text-brand">#{selectedTx.id.toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:gap-8 py-6 sm:py-8 border-y border-border-theme">
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">Payer</p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
                            {selectedTx.payerId.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-ink-primary">{allUsers[selectedTx.payerId]?.displayName || selectedTx.payerId}</p>
                            <p className="text-[10px] text-ink-secondary">Sender</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">Recipient</p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                            {selectedTx.recipientId.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-ink-primary">{allUsers[selectedTx.recipientId]?.displayName || selectedTx.recipientId}</p>
                            <p className="text-[10px] text-ink-secondary">Receiver</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedTx.receiptUrl && (
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">Proof of Payment</p>
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border-theme bg-gray-100 group">
                          <Image 
                            src={selectedTx.receiptUrl} 
                            alt="Receipt" 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <a 
                              href={selectedTx.receiptUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="px-4 py-2 bg-white rounded-xl font-bold text-xs shadow-xl"
                            >
                              View Original
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedTx.status === 'unpaid' && selectedTx.payerId === user.uid && (
                      <button 
                        onClick={() => handleSettleUp(selectedTx)}
                        className="w-full py-4 bg-brand text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-brand/20 transition-all active:scale-[0.98]"
                      >
                        Settle Now
                      </button>
                    )}

                    {selectedTx.status === 'pending' && selectedTx.recipientId === user.uid && (
                      <div className="space-y-4">
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 text-xs text-amber-800">
                          <AlertCircle size={16} className="shrink-0" />
                          Please verify the receipt matches your records before confirming.
                        </div>
                        <button 
                          onClick={() => handleVerifyPayment(selectedTx.id)}
                          className="w-full py-4 bg-success text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-success/20 transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={18} />
                          Confirm Receipt
                        </button>
                      </div>
                    )}
                  </div>
                </section>

                {/* Sidebar: Audit & Timeline */}
                <section className="card-theme glass h-fit">
                  <div className="card-header-theme">Settlement History</div>
                  <div className="p-6 space-y-8 relative">
                    <div className="absolute left-[31px] top-8 bottom-8 w-[1px] bg-border-theme" />
                    
                    <div className="relative flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center z-10 border-4 border-white">
                        <Plus size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink-primary">Request Created</p>
                        <p className="text-[10px] text-ink-secondary">{new Date(selectedTx.createdAt?.seconds * 1000).toLocaleString()}</p>
                      </div>
                    </div>

                    {selectedTx.paidAt && (
                      <div className="relative flex gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-4 border-white ${selectedTx.status === 'pending' ? 'bg-brand/10 text-brand' : 'bg-success/10 text-success'}`}>
                          <Upload size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-ink-primary">Proof Submitted</p>
                          <p className="text-[10px] text-ink-secondary">{new Date(selectedTx.paidAt?.seconds * 1000).toLocaleString()}</p>
                        </div>
                      </div>
                    )}

                    <div className={`relative flex gap-4 ${!selectedTx.verifiedAt ? 'opacity-40' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-4 border-white ${selectedTx.verifiedAt ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-400'}`}>
                        <CheckCircle2 size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink-primary">Verified</p>
                        <p className="text-[10px] text-ink-secondary">
                          {selectedTx.verifiedAt 
                            ? new Date(selectedTx.verifiedAt?.seconds * 1000).toLocaleString() 
                            : 'Awaiting approval'}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>

      {/* Floating Action for Mobile */}
      {(activeView === 'dashboard' || activeView === 'groups' || activeView === 'active') && (
        <div className="md:hidden fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-5 z-50">
          <button 
            onClick={createNewBill}
            className="w-14 h-14 bg-brand text-white rounded-full shadow-[0_20px_50px_rgba(37,99,235,0.4)] flex items-center justify-center hover:scale-110 transition-all active:scale-95 backdrop-blur-xl bg-opacity-95 border border-white/30"
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>
      )}

      {/* Add Bill Overlay */}
      <AnimatePresence>
        {activeView === 'add-bill' && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveView('dashboard')}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg glass rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Drag handle indicator */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 bg-border-theme rounded-full" />
              </div>
              <div className="p-5 sm:p-8 overflow-y-auto max-h-[85dvh] scroll-container">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-ink-primary">New Bill</h2>
                    <p className="text-xs text-ink-secondary font-bold uppercase tracking-widest mt-1">Settlement Request</p>
                  </div>
                  <button 
                    onClick={() => setActiveView('dashboard')}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100/50 rounded-full text-ink-secondary hover:text-ink-primary transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreateBill} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">Amount (₱)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-ink-secondary">₱</span>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        autoFocus
                        value={newBillAmount}
                        onChange={(e) => setNewBillAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-4 text-4xl font-black bg-[#F8FAFC]/50 border border-border-theme rounded-2xl focus:outline-none focus:border-brand transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">Group (Optional)</label>
                      <select 
                        value={newBillGroupId}
                        onChange={(e) => setNewBillGroupId(e.target.value)}
                        className="w-full px-4 py-3 bg-[#F8FAFC]/50 border border-border-theme rounded-xl focus:outline-none focus:border-brand transition-all text-sm font-medium appearance-none"
                      >
                        <option value="">Personal (No Group)</option>
                        {groups.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">Recipient ID</label>
                      <input 
                        type="text" 
                        required
                        value={newBillRecipient}
                        onChange={(e) => setNewBillRecipient(e.target.value)}
                        placeholder="e.g. recipient_456"
                        className="w-full px-4 py-3 bg-[#F8FAFC]/50 border border-border-theme rounded-xl focus:outline-none focus:border-brand transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">Category</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {[
                        { id: 'food', label: 'Food' },
                        { id: 'transport', label: 'Transport' },
                        { id: 'utilities', label: 'Bills' },
                        { id: 'entertainment', label: 'Fun' },
                        { id: 'others', label: 'Other' }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setNewBillCategory(cat.id)}
                          className={`py-2 px-1 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                            newBillCategory === cat.id 
                              ? 'bg-brand text-white border-brand shadow-md' 
                              : 'bg-white text-ink-secondary border-border-theme hover:border-brand/50'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">Description</label>
                    <input 
                      type="text" 
                      value={newBillDescription}
                      onChange={(e) => setNewBillDescription(e.target.value)}
                      placeholder="What was this for?"
                      className="w-full px-4 py-3 bg-[#F8FAFC]/50 border border-border-theme rounded-xl focus:outline-none focus:border-brand transition-all text-sm font-medium"
                    />
                  </div>

                  <div className="pt-4 pb-2">
                    <button
                      type="submit"
                      className="w-full py-4 bg-brand text-white rounded-2xl font-bold text-base sm:text-lg hover:opacity-90 transition-all shadow-xl shadow-brand/20 active:scale-[0.98]"
                    >
                      Create Request
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
