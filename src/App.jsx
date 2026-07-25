import React, { useState, useEffect } from 'react';
import EntryForm from './components/EntryForm';
import SalesList from './components/SalesList';
import PrintLabels from './components/PrintLabels';
import InventoryList from './components/InventoryList';
import SettingsPanel from './components/SettingsPanel';
import Login from './components/Login';

// Default mock inventory
const DEFAULT_INVENTORY = [
  { id: '1', name: 'Diamond Necklace', sku: 'DN-001', price: 5500, stock: 12 },
  { id: '2', name: 'Gold Ring', sku: 'GR-002', price: 1200, stock: 25 },
  { id: '3', name: 'Silver Bracelet', sku: 'SB-003', price: 450, stock: 40 },
  { id: '4', name: 'Custom Pendant', sku: 'CP-004', price: 850, stock: 18 }
];

// Default mock sales
const DEFAULT_SALES = [
  {
    id: 'SC0001',
    date: '2026-07-08',
    customerName: 'Sophia Loren',
    contactNo: '+1 (555) 019-2834',
    address: '123 Fifth Ave, New York, NY 10003',
    productName: 'Diamond Necklace',
    price: 5500,
    paymentStatus: 'done',
    courierStatus: 'done',
    orderStatus: 'done'
  },
  {
    id: 'SC0002',
    date: '2026-07-09',
    customerName: 'Liam Neeson',
    contactNo: '+1 (555) 048-9128',
    address: '456 Broadway, New York, NY 10012',
    productName: 'Gold Ring',
    price: 1200,
    paymentStatus: 'done',
    courierStatus: 'pending',
    orderStatus: 'pending'
  }
];

const DEFAULT_SETTINGS = {
  businessName: 'Saaj Creation',
  currency: '$',
  taxRate: 0,
  theme: 'light',
  googleSheetsUrl: 'https://script.google.com/macros/s/AKfycbwCFHkaegpx2s-CQfSdJiDl4J24JRRU5hs3LdCdBNUF6I1EmJPAPBmjCVZPZYt6_ez6IQ/exec',
  aiAutofillEnabled: false
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('saaj_logged_in') === 'true');
  const [activeTab, setActiveTab] = useState('entry');
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [toast, setToast] = useState(null);

  // Load database on mount
  useEffect(() => {
    const savedSales = localStorage.getItem('saaj_sales');
    const savedInventory = localStorage.getItem('saaj_inventory');
    const savedSettings = localStorage.getItem('saaj_settings');

    if (savedSales) {
      setSales(JSON.parse(savedSales));
    } else {
      setSales(DEFAULT_SALES);
      localStorage.setItem('saaj_sales', JSON.stringify(DEFAULT_SALES));
    }

    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    } else {
      setInventory(DEFAULT_INVENTORY);
      localStorage.setItem('saaj_inventory', JSON.stringify(DEFAULT_INVENTORY));
    }

    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      let updated = false;
      if (parsedSettings.googleSheetsUrl === undefined || parsedSettings.googleSheetsUrl === 'https://script.google.com/macros/s/AKfycbzmrxAaEUQfAiX5732PFXzcTwOi75GL43sLLMLcxgfmv5LIUhSzuYTN0NlSt6TxePRgUA/exec') {
        parsedSettings.googleSheetsUrl = DEFAULT_SETTINGS.googleSheetsUrl;
        updated = true;
      }
      if (parsedSettings.businessName === 'Saaj Create') {
        parsedSettings.businessName = 'Saaj Creation';
        updated = true;
      }
      if (parsedSettings.aiAutofillEnabled === undefined) {
        parsedSettings.aiAutofillEnabled = false;
        updated = true;
      }
      if (updated) {
        localStorage.setItem('saaj_settings', JSON.stringify(parsedSettings));
      }
      setSettings(parsedSettings);
      applyTheme(parsedSettings.theme || 'light');
    } else {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem('saaj_settings', JSON.stringify(DEFAULT_SETTINGS));
      applyTheme(DEFAULT_SETTINGS.theme);
    }
  }, []);

  // Show toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Helper to apply dark/light class to document
  const applyTheme = (theme) => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  };

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('saaj_settings', JSON.stringify(newSettings));
    applyTheme(newSettings.theme);
    showToast('Settings saved successfully!');
  };

  const handleClearAllData = () => {
    localStorage.removeItem('saaj_sales');
    localStorage.removeItem('saaj_inventory');
    setSales([]);
    setInventory(DEFAULT_INVENTORY);
    localStorage.setItem('saaj_inventory', JSON.stringify(DEFAULT_INVENTORY));
    showToast('All transaction records cleared. Inventory reset to default.', 'warning');
  };

  const syncSaleToGoogleSheet = async (sale, currentSales) => {
    if (!settings.googleSheetsUrl) return false;
    try {
      await fetch(settings.googleSheetsUrl, {
        method: 'POST',
        mode: 'no-cors', // Bypass CORS redirect block
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(sale),
      });

      // In 'no-cors' mode, we cannot read the response body or status.
      // But if the fetch does not throw, the request was successfully dispatched to Google's servers.
      const listToUpdate = currentSales || sales;
      const updatedSales = listToUpdate.map(s =>
        s.id === sale.id ? { ...s, synced: true } : s
      );
      setSales(updatedSales);
      localStorage.setItem('saaj_sales', JSON.stringify(updatedSales));
      return true;
    } catch (error) {
      console.error('Error syncing to Google Sheet:', error);
    }
    return false;
  };

  const syncAllInventoryToGoogleSheet = async (currentInventory) => {
    if (!settings.googleSheetsUrl) return false;
    const listToSync = currentInventory || inventory;
    try {
      await fetch(settings.googleSheetsUrl, {
        method: 'POST',
        mode: 'no-cors', // Bypass CORS redirect block
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          type: 'inventory_sync',
          items: listToSync.map(item => ({
            id: item.id,
            sku: item.sku,
            name: item.name,
            price: item.price
          }))
        }),
      });
      return true;
    } catch (error) {
      console.error('Error syncing inventory to Google Sheet:', error);
    }
    return false;
  };

  // Toast Notification component
  const Toast = () => {
    if (!toast) return null;
    const bgClass = toast.type === 'warning' ? 'bg-error text-on-error' : 'bg-secondary-container text-on-secondary-container';
    return (
      <div className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 font-bold border border-outline-variant flex items-center gap-2 ${bgClass}`}>
        <span className="material-symbols-outlined">
          {toast.type === 'warning' ? 'warning' : 'check_circle'}
        </span>
        <span>{toast.message}</span>
      </div>
    );
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} settings={settings} />;
  }

  return (
    <div className="bg-surface text-on-surface font-body-md no-scrollbar overflow-x-hidden min-h-screen pb-24">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-margin-mobile h-14 bg-surface border-b border-outline-variant shadow-none">
        <div className="flex items-center gap-2">
          <button className="hover:bg-surface-variant transition-colors p-2 rounded-full active:opacity-70 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-primary">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Saaj Creation Logo" 
              className="h-8 w-8 rounded-full object-cover border border-outline-variant shadow-sm"
            />
            <h1 className="font-headline-md-mobile text-headline-md-mobile text-primary tracking-tight font-bold">
              {settings.businessName}
            </h1>
          </div>
        </div>
        <button 
          onClick={() => {
            if (window.confirm('Are you sure you want to log out?')) {
              localStorage.removeItem('saaj_logged_in');
              setIsLoggedIn(false);
            }
          }}
          className="hover:bg-surface-variant transition-colors p-2 rounded-full active:opacity-70 active:scale-95 transition-all"
          title="Log Out"
        >
          <span className="material-symbols-outlined text-primary">logout</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-margin-mobile max-w-4xl mx-auto flex flex-col gap-6">
        {activeTab === 'entry' && (
          <EntryForm
            sales={sales}
            setSales={(newSales) => {
              setSales(newSales);
              localStorage.setItem('saaj_sales', JSON.stringify(newSales));
            }}
            inventory={inventory}
            setInventory={(newInv) => {
              setInventory(newInv);
              localStorage.setItem('saaj_inventory', JSON.stringify(newInv));
            }}
            settings={settings}
            showToast={showToast}
            syncSaleToGoogleSheet={syncSaleToGoogleSheet}
          />
        )}

        {activeTab === 'sales' && (
          <SalesList
            sales={sales}
            setSales={(newSales) => {
              setSales(newSales);
              localStorage.setItem('saaj_sales', JSON.stringify(newSales));
            }}
            settings={settings}
            inventory={inventory}
            showToast={showToast}
            syncSaleToGoogleSheet={syncSaleToGoogleSheet}
          />
        )}

        {activeTab === 'print' && (
          <PrintLabels
            showToast={showToast}
            settings={settings}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryList
            inventory={inventory}
            setInventory={(newInv) => {
              setInventory(newInv);
              localStorage.setItem('saaj_inventory', JSON.stringify(newInv));
            }}
            settings={settings}
            showToast={showToast}
            syncAllInventoryToGoogleSheet={syncAllInventoryToGoogleSheet}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onClearData={handleClearAllData}
            sales={sales}
            inventory={inventory}
            setSales={(newSales) => {
              setSales(newSales);
              localStorage.setItem('saaj_sales', JSON.stringify(newSales));
            }}
            setInventory={(newInv) => {
              setInventory(newInv);
              localStorage.setItem('saaj_inventory', JSON.stringify(newInv));
            }}
            showToast={showToast}
          />
        )}
      </main>


      {/* Toast popup */}
      <Toast />

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface border-t border-outline-variant px-unit pb-2 pt-2 shadow-sm">
        <button
          onClick={() => setActiveTab('entry')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-150 rounded-full ${activeTab === 'entry'
              ? 'text-primary bg-secondary-container font-bold'
              : 'text-on-surface-variant hover:text-primary'
            }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'entry' ? "'FILL' 1" : "'FILL' 0" }}>
            edit_note
          </span>
          <span className="text-label-caps font-label-caps text-[10px]">Entry</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-150 rounded-full ${activeTab === 'sales'
              ? 'text-primary bg-secondary-container font-bold'
              : 'text-on-surface-variant hover:text-primary'
            }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'sales' ? "'FILL' 1" : "'FILL' 0" }}>
            payments
          </span>
          <span className="text-label-caps font-label-caps text-[10px]">Sales</span>
        </button>

        <button
          onClick={() => setActiveTab('print')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-150 rounded-full ${activeTab === 'print'
              ? 'text-primary bg-secondary-container font-bold'
              : 'text-on-surface-variant hover:text-primary'
            }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'print' ? "'FILL' 1" : "'FILL' 0" }}>
            print
          </span>
          <span className="text-label-caps font-label-caps text-[10px]">Print</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-150 rounded-full ${activeTab === 'inventory'
              ? 'text-primary bg-secondary-container font-bold'
              : 'text-on-surface-variant hover:text-primary'
            }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'inventory' ? "'FILL' 1" : "'FILL' 0" }}>
            diamond
          </span>
          <span className="text-label-caps font-label-caps text-[10px]">Inventory</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-150 rounded-full ${activeTab === 'settings'
              ? 'text-primary bg-secondary-container font-bold'
              : 'text-on-surface-variant hover:text-primary'
            }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'settings' ? "'FILL' 1" : "'FILL' 0" }}>
            settings
          </span>
          <span className="text-label-caps font-label-caps text-[10px]">Settings</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
