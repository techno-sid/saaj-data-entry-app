import React, { useState } from 'react';

function SalesList({ sales, setSales, settings, inventory, showToast, syncSaleToGoogleSheet }) {
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [courierFilter, setCourierFilter] = useState('');
  const [orderFilter, setOrderFilter] = useState('');
  const [selectedSale, setSelectedSale] = useState(null); // For details modal
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncingRowId, setSyncingRowId] = useState(null);

  // Calculate Metrics
  const courierPendingCount = sales.filter(s => s.courierStatus !== 'done').length;
  const activeOrdersCount = sales.filter(s => s.orderStatus !== 'done' || s.courierStatus !== 'done').length;
  const paymentPendingCount = sales.filter(s => s.paymentStatus !== 'done').length;

  // Handle status toggle in table or modal
  const handleToggleStatus = (saleId, field) => {
    const updated = sales.map(s => {
      if (s.id === saleId) {
        const newVal = s[field] === 'done' ? 'pending' : 'done';
        
        // If status changes, mark it as unsynced so they can re-sync to Google Sheets!
        const updatedSale = { ...s, [field]: newVal, synced: false };
        
        // If modal is open for this sale, update modal state too
        if (selectedSale && selectedSale.id === saleId) {
          setSelectedSale(updatedSale);
        }
        return updatedSale;
      }
      return s;
    });
    setSales(updated);
    showToast(`Updated status. Ledger row marked for re-sync.`);
  };

  // Sync a single transaction to Google Sheet
  const handleSyncRow = async (e, sale) => {
    e.stopPropagation();
    if (!settings.googleSheetsUrl) {
      showToast('Configure a Google Sheet URL in Settings first.', 'warning');
      return;
    }
    setSyncingRowId(sale.id);
    showToast(`Syncing transaction ${sale.id}...`);
    const success = await syncSaleToGoogleSheet(sale);
    setSyncingRowId(null);
    if (success) {
      showToast(`Transaction ${sale.id} synced to Google Sheets!`);
    } else {
      showToast(`Sync failed for ${sale.id}. Check settings connection.`, 'warning');
    }
  };

  // Bulk sync all unsynced records
  const handleSyncAll = async () => {
    if (!settings.googleSheetsUrl) {
      showToast('Configure a Google Sheet URL in Settings first.', 'warning');
      return;
    }
    const unsynced = sales.filter(s => !s.synced);
    if (unsynced.length === 0) {
      showToast('All transaction records are already synced.');
      return;
    }

    setIsSyncingAll(true);
    showToast(`Syncing ${unsynced.length} records to Google Sheets...`);
    
    let successCount = 0;
    let currentList = [...sales];
    
    for (const sale of unsynced) {
      const success = await syncSaleToGoogleSheet(sale, currentList);
      if (success) {
        successCount++;
        currentList = currentList.map(s => s.id === sale.id ? { ...s, synced: true } : s);
      }
    }

    setIsSyncingAll(false);
    showToast(`Successfully synced ${successCount} records to Google Sheets!`);
  };

  // Delete transaction
  const handleDeleteSale = (saleId) => {
    if (window.confirm(`Are you sure you want to delete transaction ${saleId}?`)) {
      const updated = sales.filter(s => s.id !== saleId);
      setSales(updated);
      if (selectedSale && selectedSale.id === saleId) {
        setSelectedSale(null);
      }
      showToast(`Transaction ${saleId} deleted.`, 'warning');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (sales.length === 0) {
      showToast('No transaction data to export.', 'warning');
      return;
    }

    const headers = ['ID', 'Date', 'Customer Name', 'Contact No', 'Address', 'Pincode', 'Product', 'Price', 'Payment Status', 'Courier Status', 'Order Status', 'Synced'];
    const rows = sales.map(s => [
      s.id,
      s.date,
      s.customerName,
      `"${s.contactNo}"`,
      `"${s.address.replace(/"/g, '""')}"`,
      `"${(s.pincode || '').replace(/"/g, '""')}"`,
      s.productName,
      s.price,
      s.paymentStatus,
      s.courierStatus,
      s.orderStatus,
      s.synced ? 'true' : 'false'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `saaj_sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV report downloaded successfully!');
  };

  // Filter Sales
  const filteredSales = sales.filter(s => {
    const matchesSearch = 
      s.customerName.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.contactNo.toLowerCase().includes(search.toLowerCase());
    
    const matchesProduct = selectedProduct ? s.productName === selectedProduct : true;
    const matchesPayment = paymentFilter ? s.paymentStatus === paymentFilter : true;
    const matchesCourier = courierFilter ? s.courierStatus === courierFilter : true;
    const matchesOrder = orderFilter ? s.orderStatus === orderFilter : true;

    return matchesSearch && matchesProduct && matchesPayment && matchesCourier && matchesOrder;
  });

  // Render a jewel-tone status chip
  const renderStatusChip = (status, saleId, field) => {
    const isDone = status === 'done';
    const bgClass = isDone ? 'bg-[#d1e7dd] text-[#0f5132] hover:bg-[#c1d7cd]' : 'bg-[#f8d7da] text-[#842029] hover:bg-[#e8c7ca]';
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleToggleStatus(saleId, field);
        }}
        className={`px-2.5 py-1 rounded text-xs font-bold font-label-caps tracking-wider cursor-pointer transition-all uppercase select-none ${bgClass}`}
        title="Click to toggle status"
      >
        {isDone ? 'Done' : 'Pending'}
      </button>
    );
  };

  // Render Sync Icon
  const renderSyncCell = (sale) => {
    if (sale.synced) {
      return (
        <span className="material-symbols-outlined text-[#0f5132]" title="Synced to Google Drive">
          cloud_done
        </span>
      );
    }
    const isSyncing = syncingRowId === sale.id;
    return (
      <button
        onClick={(e) => handleSyncRow(e, sale)}
        disabled={isSyncing}
        className="p-1 hover:bg-surface-variant rounded text-outline hover:text-secondary transition-colors cursor-pointer disabled:opacity-50"
        title="Offline. Click to sync to Google Sheet."
      >
        <span className={`material-symbols-outlined text-sm ${isSyncing ? 'animate-pulse' : ''}`}>
          {isSyncing ? 'sync' : 'cloud_upload'}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn max-w-5xl mx-auto">
      {/* Hero Header */}
      <header className="flex justify-between items-end">
        <div>
          <span className="font-label-caps text-label-caps text-on-tertiary-container uppercase">Operational Suite</span>
          <h2 className="font-headline-md text-headline-md text-primary mt-1">Sales Ledger</h2>
        </div>
        <div className="flex gap-2">
          {settings.googleSheetsUrl && (
            <button
              onClick={handleSyncAll}
              disabled={isSyncingAll}
              className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg text-body-md hover:opacity-95 transition-all font-bold cursor-pointer disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-sm ${isSyncingAll ? 'animate-spin' : ''}`}>
                cloud_sync
              </span>
              {isSyncingAll ? 'Syncing...' : 'Sync Ledger'}
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 border border-outline px-4 py-2 rounded-lg text-body-md hover:bg-surface-variant transition-all font-bold cursor-pointer bg-surface-container-lowest"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export CSV
          </button>
        </div>
      </header>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Courier Pending Card */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-2 text-on-surface-variant mb-1">
            <span className="material-symbols-outlined text-error">local_shipping</span>
            <span className="font-label-caps text-label-caps uppercase">Courier Pending</span>
          </div>
          <span className="font-display-lg text-3xl font-bold text-error">
            {courierPendingCount}
          </span>
        </div>

        {/* Active Orders Card */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-2 text-on-surface-variant mb-1">
            <span className="material-symbols-outlined text-secondary">local_shipping</span>
            <span className="font-label-caps text-label-caps uppercase">Active Orders</span>
          </div>
          <span className="font-display-lg text-3xl font-bold text-primary">
            {activeOrdersCount}
          </span>
        </div>

        {/* Payment Pending Card */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-2 text-on-surface-variant mb-1">
            <span className="material-symbols-outlined text-error">pending_actions</span>
            <span className="font-label-caps text-label-caps uppercase">Payments Pending</span>
          </div>
          <span className="font-display-lg text-3xl font-bold text-error">
            {paymentPendingCount}
          </span>
        </div>
      </div>

      {/* Search and Filters Controls */}
      <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant flex flex-col gap-4">
        <div className="relative">
          <input
            className="w-full bg-surface border border-outline rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-secondary transition-colors text-body-md font-body"
            placeholder="Search by ID, customer name, contact..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-body-lg">search</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Product Filter */}
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-xs text-on-surface-variant">PRODUCT</label>
            <select
              className="bg-surface border border-outline rounded-lg px-3 py-2 focus:outline-none focus:border-secondary transition-colors text-body-md cursor-pointer"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">All Products</option>
              {Array.from(new Set(sales.map(s => s.productName))).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-xs text-on-surface-variant">PAYMENT</label>
            <select
              className="bg-surface border border-outline rounded-lg px-3 py-2 focus:outline-none focus:border-secondary transition-colors text-body-md cursor-pointer"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="done">Done</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Courier Status Filter */}
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-xs text-on-surface-variant">COURIER</label>
            <select
              className="bg-surface border border-outline rounded-lg px-3 py-2 focus:outline-none focus:border-secondary transition-colors text-body-md cursor-pointer"
              value={courierFilter}
              onChange={(e) => setCourierFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="done">Done</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Order Status Filter */}
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-xs text-on-surface-variant">ORDER STATUS</label>
            <select
              className="bg-surface border border-outline rounded-lg px-3 py-2 focus:outline-none focus:border-secondary transition-colors text-body-md cursor-pointer"
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="done">Done</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sales List Table (Desktop view) / Cards (Mobile view) */}
      <div className="w-full">
        {filteredSales.length === 0 ? (
          <div className="bg-surface-container-lowest p-8 text-center rounded-xl border border-outline-variant">
            <span className="material-symbols-outlined text-outline text-4xl mb-2">find_in_page</span>
            <p className="text-on-surface-variant text-body-lg font-bold">No sales records found</p>
            <p className="text-outline text-xs mt-1">Try adjusting your filters or adding a new transaction.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
              <table className="w-full border-collapse text-left text-body-md">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low">
                    <th className="font-label-caps text-label-caps text-on-surface-variant p-4">ID</th>
                    <th className="font-label-caps text-label-caps text-on-surface-variant p-4">Date</th>
                    <th className="font-label-caps text-label-caps text-on-surface-variant p-4">Customer</th>
                    <th className="font-label-caps text-label-caps text-on-surface-variant p-4">Contact</th>
                    <th className="font-label-caps text-label-caps text-on-surface-variant p-4">Product</th>
                    <th className="font-label-caps text-label-caps text-on-surface-variant p-4 text-right">Price</th>
                    <th className="font-label-caps text-label-caps text-on-surface-variant p-4 text-center">Payment</th>
                    <th className="font-label-caps text-label-caps text-on-surface-variant p-4 text-center">Courier</th>
                    <th className="font-label-caps text-label-caps text-on-surface-variant p-4 text-center">Order Rec.</th>
                    <th className="font-label-caps text-label-caps text-on-surface-variant p-4 text-center">Sync</th>
                    <th className="font-label-caps text-label-caps text-on-surface-variant p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      onClick={() => setSelectedSale(sale)}
                      className="border-b border-outline-variant hover:bg-surface-container-low/55 transition-colors cursor-pointer"
                    >
                      <td className="p-4 font-bold text-primary">{sale.id}</td>
                      <td className="p-4 whitespace-nowrap">{sale.date}</td>
                      <td className="p-4 font-bold max-w-[140px] truncate">{sale.customerName}</td>
                      <td className="p-4 whitespace-nowrap">{sale.contactNo}</td>
                      <td className="p-4 max-w-[140px] truncate">{sale.productName}</td>
                      <td className="p-4 font-bold text-right text-primary whitespace-nowrap">
                        {settings.currency}{Number(sale.price).toLocaleString()}
                      </td>
                      <td className="p-4 text-center">{renderStatusChip(sale.paymentStatus, sale.id, 'paymentStatus')}</td>
                      <td className="p-4 text-center">{renderStatusChip(sale.courierStatus, sale.id, 'courierStatus')}</td>
                      <td className="p-4 text-center">{renderStatusChip(sale.orderStatus, sale.id, 'orderStatus')}</td>
                      <td className="p-4 text-center">{renderSyncCell(sale)}</td>
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedSale(sale)}
                            className="p-1 hover:bg-surface-variant rounded text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                            title="View details"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </button>
                          <button
                            onClick={() => handleDeleteSale(sale.id)}
                            className="p-1 hover:bg-[#ffdad6] rounded text-error hover:text-[#93000a] transition-colors cursor-pointer"
                            title="Delete transaction"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="block md:hidden flex flex-col gap-4">
              {filteredSales.map((sale) => (
                <div
                  key={sale.id}
                  onClick={() => setSelectedSale(sale)}
                  className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex flex-col gap-4 shadow-sm hover:border-outline transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-center border-b border-outline-variant pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary text-body-lg">{sale.id}</span>
                      {sale.synced ? (
                        <span className="material-symbols-outlined text-[#0f5132] text-sm" title="Synced">cloud_done</span>
                      ) : (
                        <span className="material-symbols-outlined text-outline text-sm" title="Offline">cloud_off</span>
                      )}
                    </div>
                    <span className="text-on-surface-variant text-xs">{sale.date}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div>
                      <span className="font-label-caps text-on-surface-variant block uppercase text-[10px]">Customer</span>
                      <span className="font-bold text-primary text-sm">{sale.customerName}</span>
                    </div>
                    <div>
                      <span className="font-label-caps text-on-surface-variant block uppercase text-[10px]">Product</span>
                      <span className="font-bold text-primary text-sm">{sale.productName}</span>
                    </div>
                    <div>
                      <span className="font-label-caps text-on-surface-variant block uppercase text-[10px]">Contact</span>
                      <span className="text-on-surface-variant">{sale.contactNo}</span>
                    </div>
                    <div>
                      <span className="font-label-caps text-on-surface-variant block uppercase text-[10px]">Amount</span>
                      <span className="font-bold text-primary text-sm">{settings.currency}{Number(sale.price).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-outline-variant pt-3 text-center">
                    <div>
                      <span className="font-label-caps text-on-surface-variant block uppercase text-[9px] mb-1">Payment</span>
                      {renderStatusChip(sale.paymentStatus, sale.id, 'paymentStatus')}
                    </div>
                    <div>
                      <span className="font-label-caps text-on-surface-variant block uppercase text-[9px] mb-1">Courier</span>
                      {renderStatusChip(sale.courierStatus, sale.id, 'courierStatus')}
                    </div>
                    <div>
                      <span className="font-label-caps text-on-surface-variant block uppercase text-[9px] mb-1">Order Rec.</span>
                      {renderStatusChip(sale.orderStatus, sale.id, 'orderStatus')}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-1 border-t border-outline-variant/60 pt-2" onClick={(e) => e.stopPropagation()}>
                    <div>
                      {!sale.synced && settings.googleSheetsUrl && (
                        <button
                          onClick={(e) => handleSyncRow(e, sale)}
                          className="flex items-center gap-1 text-xs text-secondary font-bold font-label-caps cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">cloud_upload</span>
                          Sync to Sheet
                        </button>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedSale(sale)}
                        className="flex items-center gap-1 text-xs text-secondary font-bold font-label-caps cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        Details
                      </button>
                      <button
                        onClick={() => handleDeleteSale(sale.id)}
                        className="flex items-center gap-1 text-xs text-error font-bold font-label-caps cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-xl border border-outline-variant p-6 shadow-xl flex flex-col gap-5 animate-slideUp">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">info</span>
                <h3 className="font-headline-sm text-headline-sm text-primary">Transaction Detail</h3>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="p-1 hover:bg-surface-variant rounded-full text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-4 text-body-md">
              <div className="grid grid-cols-2 gap-4 border-b border-outline-variant/50 pb-3">
                <div>
                  <span className="font-label-caps text-on-surface-variant block uppercase text-[10px]">Transaction ID</span>
                  <span className="font-bold text-primary text-lg">{selectedSale.id}</span>
                </div>
                <div>
                  <span className="font-label-caps text-on-surface-variant block uppercase text-[10px]">Date</span>
                  <span className="font-bold text-primary text-lg">{selectedSale.date}</span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-surface-container-low p-3 rounded border border-outline-variant">
                <div>
                  <span className="font-label-caps text-on-surface-variant block uppercase text-[10px]">Google Sheets Status</span>
                  <span className="text-body-md font-bold text-primary">
                    {selectedSale.synced ? 'Synchronized' : 'Not Synchronized (Local Only)'}
                  </span>
                </div>
                {!selectedSale.synced && settings.googleSheetsUrl && (
                  <button
                    onClick={(e) => handleSyncRow(e, selectedSale)}
                    className="bg-secondary text-white px-3 py-1 rounded text-xs font-bold font-label-caps tracking-wider cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    Sync Now
                  </button>
                )}
              </div>

              <div>
                <span className="font-label-caps text-on-surface-variant block uppercase text-[10px]">Customer Name</span>
                <span className="font-bold text-primary text-base">{selectedSale.customerName}</span>
              </div>

              <div>
                <span className="font-label-caps text-on-surface-variant block uppercase text-[10px]">Contact No</span>
                <span className="text-on-surface-variant text-base font-medium">{selectedSale.contactNo}</span>
              </div>

              <div>
                <span className="font-label-caps text-on-surface-variant block uppercase text-[10px]">Delivery Address</span>
                <span className="text-on-surface-variant whitespace-pre-wrap">{selectedSale.address}</span>
              </div>

              {selectedSale.pincode && selectedSale.pincode !== 'N/A' && (
                <div>
                  <span className="font-label-caps text-on-surface-variant block uppercase text-[10px]">Pincode</span>
                  <span className="text-on-surface-variant text-base font-semibold">{selectedSale.pincode}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-b border-outline-variant/50 py-3 my-1">
                <div>
                  <span className="font-label-caps text-on-surface-variant block uppercase text-[10px]">Product purchased</span>
                  <span className="font-bold text-primary">{selectedSale.productName}</span>
                </div>
                <div>
                  <span className="font-label-caps text-on-surface-variant block uppercase text-[10px]">Total Paid</span>
                  <span className="font-bold text-primary text-lg">{settings.currency}{Number(selectedSale.price).toLocaleString()}</span>
                </div>
              </div>

              {/* Status toggles inside details modal */}
              <div className="flex flex-col gap-3">
                <span className="font-label-caps text-on-surface-variant block uppercase text-[10px]">Update Transaction Status</span>
                
                {/* Payment toggle */}
                <div
                  onClick={() => handleToggleStatus(selectedSale.id, 'paymentStatus')}
                  className="flex justify-between items-center p-2.5 rounded border border-outline-variant hover:border-outline cursor-pointer bg-surface-container-low transition-colors select-none"
                >
                  <span className="font-label-caps text-xs text-primary font-bold">Payment Status</span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-label-caps tracking-wider uppercase text-white ${
                    selectedSale.paymentStatus === 'done' ? 'bg-[#0f5132]' : 'bg-[#842029]'
                  }`}>
                    {selectedSale.paymentStatus === 'done' ? 'Done' : 'Pending'}
                  </span>
                </div>

                {/* Courier toggle */}
                <div
                  onClick={() => handleToggleStatus(selectedSale.id, 'courierStatus')}
                  className="flex justify-between items-center p-2.5 rounded border border-outline-variant hover:border-outline cursor-pointer bg-surface-container-low transition-colors select-none"
                >
                  <span className="font-label-caps text-xs text-primary font-bold">Sent Courier</span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-label-caps tracking-wider uppercase text-white ${
                    selectedSale.courierStatus === 'done' ? 'bg-[#0f5132]' : 'bg-[#842029]'
                  }`}>
                    {selectedSale.courierStatus === 'done' ? 'Done' : 'Pending'}
                  </span>
                </div>

                {/* Order Received toggle */}
                <div
                  onClick={() => handleToggleStatus(selectedSale.id, 'orderStatus')}
                  className="flex justify-between items-center p-2.5 rounded border border-outline-variant hover:border-outline cursor-pointer bg-surface-container-low transition-colors select-none"
                >
                  <span className="font-label-caps text-xs text-primary font-bold">Order Received</span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-label-caps tracking-wider uppercase text-white ${
                    selectedSale.orderStatus === 'done' ? 'bg-[#0f5132]' : 'bg-[#842029]'
                  }`}>
                    {selectedSale.orderStatus === 'done' ? 'Done' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-2 border-t border-outline-variant pt-4">
              <button
                onClick={() => handleDeleteSale(selectedSale.id)}
                className="px-4 py-2 border border-error text-error hover:bg-[#ffdad6] rounded-lg text-body-md font-bold transition-all cursor-pointer"
              >
                Delete Sale
              </button>
              <button
                onClick={() => setSelectedSale(null)}
                className="px-5 py-2 bg-primary text-on-primary hover:opacity-90 rounded-lg text-body-md font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesList;
