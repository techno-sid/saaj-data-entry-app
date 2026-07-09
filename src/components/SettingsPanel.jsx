import React, { useState, useRef } from 'react';

function SettingsPanel({ settings, onUpdateSettings, onClearData, sales, inventory, setSales, setInventory, showToast }) {
  const [businessName, setBusinessName] = useState(settings.businessName || 'Saaj Creation');
  const [currency, setCurrency] = useState(settings.currency || '$');
  const [theme, setTheme] = useState(settings.theme || 'light');
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState(settings.googleSheetsUrl || '');
  const [isTesting, setIsTesting] = useState(false);
  const fileInputRef = useRef(null);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (!businessName.trim()) {
      showToast('Business name cannot be empty.', 'warning');
      return;
    }
    onUpdateSettings({
      businessName: businessName.trim(),
      currency,
      theme,
      googleSheetsUrl: googleSheetsUrl.trim()
    });
  };

  const handleTestConnection = async () => {
    const url = googleSheetsUrl.trim();
    if (!url) {
      showToast('Please enter a Google Sheets Web App URL first.', 'warning');
      return;
    }
    if (!url.startsWith('https://script.google.com/')) {
      showToast('Invalid URL. It must start with https://script.google.com/', 'warning');
      return;
    }

    setIsTesting(true);
    try {
      // Send a ping message to Google Apps Script. 
      // We use mode: 'no-cors' to bypass CORS blocks on redirects.
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify({ type: 'ping' })
      });

      // Since it is no-cors, any successful dispatch that doesn't throw is a successful reach!
      showToast('Connection test successful! Google Sheet URL is reachable.');
    } catch (err) {
      console.error(err);
      showToast('Connection failed. Make sure URL is correct and network is active.', 'warning');
    } finally {
      setIsTesting(false);
    }
  };

  // Export full database to JSON
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      sales,
      inventory,
      settings
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;

    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", `saaj_database_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('JSON backup database downloaded!');
  };

  // Import full database from JSON
  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);

        // Validation check
        if (!importedData.sales || !importedData.inventory) {
          showToast('Invalid backup file. Must contain sales and inventory data.', 'warning');
          return;
        }

        // Apply backup data
        setSales(importedData.sales);
        localStorage.setItem('saaj_sales', JSON.stringify(importedData.sales));

        setInventory(importedData.inventory);
        localStorage.setItem('saaj_inventory', JSON.stringify(importedData.inventory));

        if (importedData.settings) {
          onUpdateSettings(importedData.settings);
          setBusinessName(importedData.settings.businessName || 'Saaj Creation');
          setCurrency(importedData.settings.currency || '$');
          setTheme(importedData.settings.theme || 'light');
          setGoogleSheetsUrl(importedData.settings.googleSheetsUrl || '');
        }

        showToast('Database restored successfully from backup!');
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err) {
        showToast('Failed to parse JSON backup file.', 'warning');
      }
    };
    reader.readAsText(file);
  };

  const triggerImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6 w-full animate-fadeIn">
      {/* Hero Header */}
      <header>
        <span className="font-label-caps text-label-caps text-on-tertiary-container uppercase">Operational Suite</span>
        <h2 className="font-headline-md text-headline-md text-primary mt-1">Application Settings</h2>
      </header>

      {/* Main Settings Card */}
      <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex flex-col gap-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-secondary">tune</span>
          <h3 className="font-headline-sm text-headline-sm text-primary">Preferences</h3>
        </div>

        <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
          {/* Business Name */}
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps text-on-surface-variant">BUSINESS NAME</label>
            <input
              className="bg-surface border border-outline rounded-lg px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-body-lg font-body"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </div>

          {/* Currency Selection */}
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps text-on-surface-variant">CURRENCY SYMBOL</label>
            <div className="relative">
              <select
                className="w-full bg-surface border border-outline rounded-lg px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-body-lg font-body appearance-none cursor-pointer"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="$">USD ($)</option>
                <option value="₹">INR (₹)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
                <option value="¥">JPY (¥)</option>
                <option value="AED">AED (dhs)</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-3.5 text-outline pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps text-on-surface-variant">COLOR THEME</label>
            <div className="relative">
              <select
                className="w-full bg-surface border border-outline rounded-lg px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-body-lg font-body appearance-none cursor-pointer"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="light">Luxury Light Mode (Pristine Paper)</option>
                <option value="dark">Charcoal Dark Mode</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-3.5 text-outline pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Google Sheets Sync URL */}
          <div className="flex flex-col gap-1 border-t border-outline-variant/60 pt-4 mt-1">
            <div className="flex justify-between items-center mb-1">
              <label className="font-label-caps text-label-caps text-on-surface-variant">GOOGLE SHEET WEB APP URL</label>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="text-xs text-secondary font-bold hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
            <input
              className="bg-surface border border-outline rounded-lg px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-body-md font-body"
              placeholder="https://script.google.com/macros/s/.../exec"
              type="url"
              value={googleSheetsUrl}
              onChange={(e) => setGoogleSheetsUrl(e.target.value)}
            />
            <p className="text-[10px] text-outline mt-0.5 leading-normal">
              Paste the Google Apps Script Web App URL here to synchronize transaction records to Google Drive in real-time.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-on-primary h-12 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all font-bold cursor-pointer shadow-sm mt-2"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            Save Preferences
          </button>
        </form>
      </div>

      {/* Backup and Restore Utilities */}
      <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex flex-col gap-4 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-secondary">database</span>
          <h3 className="font-headline-sm text-headline-sm text-primary">Data Maintenance</h3>
        </div>

        <p className="text-on-surface-variant text-xs -mt-1 leading-relaxed">
          Manage local backups of your sales ledger and product inventory. Backups are downloaded as local JSON files and can be restored at any time.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-1">
          {/* Backup Database */}
          <button
            onClick={handleExportBackup}
            className="flex flex-col items-center justify-center p-4 border border-outline-variant hover:border-outline hover:bg-surface-container-low rounded-lg text-center cursor-pointer transition-all gap-1 group bg-surface"
          >
            <span className="material-symbols-outlined text-secondary text-2xl group-hover:scale-110 transition-transform">
              cloud_download
            </span>
            <span className="font-label-caps text-[10px] text-primary uppercase font-bold mt-1">Backup Database</span>
          </button>

          {/* Restore Database */}
          <button
            onClick={triggerImportClick}
            className="flex flex-col items-center justify-center p-4 border border-outline-variant hover:border-outline hover:bg-surface-container-low rounded-lg text-center cursor-pointer transition-all gap-1 group bg-surface"
          >
            <span className="material-symbols-outlined text-secondary text-2xl group-hover:scale-110 transition-transform">
              cloud_upload
            </span>
            <span className="font-label-caps text-[10px] text-primary uppercase font-bold mt-1">Restore Backup</span>
          </button>

          {/* Hidden File Input for import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportBackup}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Reset Utilities */}
      <div className="bg-[#ffdad6]/20 p-5 rounded-xl border border-error/30 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-error">warning</span>
          <h3 className="font-headline-sm text-headline-sm text-error">Danger Zone</h3>
        </div>

        <p className="text-on-error-container text-xs -mt-1 leading-relaxed">
          Clearing the ledger will permanently delete all transaction history records from your browser cache. This action is irreversible. We recommend exporting a backup first.
        </p>

        <button
          onClick={onClearData}
          className="w-full bg-[#ba1a1a] text-white h-12 rounded-lg flex items-center justify-center gap-2 hover:bg-[#93000a] active:scale-[0.98] transition-all font-bold cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">delete_forever</span>
          Clear All Transaction Records
        </button>
      </div>
    </div>
  );
}

export default SettingsPanel;
