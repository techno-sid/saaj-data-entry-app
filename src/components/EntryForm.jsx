import React, { useState, useEffect } from 'react';

function EntryForm({ sales, setSales, inventory, setInventory, settings, showToast, syncSaleToGoogleSheet }) {
  const [date, setDate] = useState('');
  const [id, setId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [address, setAddress] = useState('');
  const [productId, setProductId] = useState('');
  const [price, setPrice] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [courierStatus, setCourierStatus] = useState('pending');
  const [orderStatus, setOrderStatus] = useState('pending');

  // Set default date to today and generate next transaction ID
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);

    // Calculate next transaction ID
    if (sales) {
      const nextId = generateNextId(sales);
      setId(nextId);
    }
  }, [sales]);

  const generateNextId = (currentSales) => {
    if (!currentSales || currentSales.length === 0) return 'SC0001';
    const ids = currentSales.map(s => {
      const match = s.id.match(/SC(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxId = Math.max(...ids, 0);
    return `SC${String(maxId + 1).padStart(4, '0')}`;
  };

  const handleProductChange = (val) => {
    setProductId(val);
    const selected = inventory.find(item => item.id === val);
    if (selected) {
      setPrice(selected.price.toString());
    } else {
      setPrice('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!customerName.trim()) {
      showToast('Please enter customer name.', 'warning');
      return;
    }
    if (!productId) {
      showToast('Please select a product.', 'warning');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      showToast('Please enter a valid price.', 'warning');
      return;
    }

    const selectedProduct = inventory.find(item => item.id === productId);
    if (!selectedProduct) {
      showToast('Invalid product selected.', 'warning');
      return;
    }

    // Check stock
    if (selectedProduct.stock <= 0) {
      showToast(`${selectedProduct.name} is out of stock!`, 'warning');
      return;
    }

    // Decrement stock
    const updatedInventory = inventory.map(item => {
      if (item.id === selectedProduct.id) {
        return { ...item, stock: item.stock - 1 };
      }
      return item;
    });
    setInventory(updatedInventory);

    // Add new sale
    const newSale = {
      id,
      date,
      customerName: customerName.trim(),
      contactNo: contactNo.trim() || 'N/A',
      address: address.trim() || 'N/A',
      productName: selectedProduct.name,
      price: parsedPrice,
      paymentStatus,
      courierStatus,
      orderStatus,
      synced: false
    };

    const updatedSales = [newSale, ...sales];
    setSales(updatedSales);

    // Reset Form
    setCustomerName('');
    setContactNo('');
    setAddress('');
    setProductId('');
    setPrice('');
    setPaymentStatus('pending');
    setCourierStatus('pending');
    setOrderStatus('pending');

    if (settings.googleSheetsUrl) {
      showToast('Saving entry & syncing to Google Sheets...');
      syncSaleToGoogleSheet(newSale, updatedSales);
    } else {
      showToast('Entry saved to Saaj Creation Database (Offline)!');
    }
  };

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-8 w-full animate-fadeIn">
      {/* Hero Header */}
      <header>
        <span className="font-label-caps text-label-caps text-on-tertiary-container uppercase">Operational Suite</span>
        <h2 className="font-headline-md text-headline-md text-primary mt-1">Data Entry</h2>
      </header>

      {/* Entry Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6" id="salesForm">
        {/* Main Entry Card */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex flex-col gap-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-secondary">edit_note</span>
            <h3 className="font-headline-sm text-headline-sm text-primary">Transaction Details</h3>
          </div>

          {/* Date & ID */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-label-caps text-label-caps text-on-surface-variant">DATE</label>
              <input
                className="bg-surface border border-outline rounded-lg px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-body-lg font-body-lg w-full"
                id="entryDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-caps text-label-caps text-on-surface-variant">ID</label>
              <input
                className="bg-surface-variant/30 border border-outline rounded-lg px-4 py-3 text-on-surface-variant text-body-lg font-body-lg w-full cursor-not-allowed"
                type="text"
                value={id}
                readOnly
              />
            </div>
          </div>

          {/* Customer Info */}
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps text-on-surface-variant">CUSTOMER NAME</label>
            <input
              className="bg-surface border border-outline rounded-lg px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-body-lg font-body-lg"
              placeholder="Enter name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps text-on-surface-variant">CONTACT NO</label>
            <div className="relative">
              <input
                className="w-full bg-surface border border-outline rounded-lg px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-body-lg font-body-lg"
                placeholder="+1 (000) 000-0000"
                type="tel"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
              />
              <span className="material-symbols-outlined absolute right-3 top-3.5 text-outline text-body-md">call</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps text-on-surface-variant">ADDRESS</label>
            <textarea
              className="bg-surface border border-outline rounded-lg px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-body-lg font-body-lg resize-none"
              placeholder="Delivery address..."
              rows="2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            ></textarea>
          </div>

          {/* Product Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps text-on-surface-variant">PRODUCT</label>
            <div className="relative">
              <select
                className="w-full bg-surface border border-outline rounded-lg px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-body-lg font-body-lg appearance-none cursor-pointer"
                value={productId}
                onChange={(e) => handleProductChange(e.target.value)}
                required
              >
                <option value="" disabled>Select a product...</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.id} disabled={item.stock <= 0}>
                    {item.name} ({settings.currency}{item.price}) {item.stock <= 0 ? '- OUT OF STOCK' : `[Stock: ${item.stock}]`}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-3.5 text-outline pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Product Price */}
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps text-on-surface-variant">PRODUCT PRICE</label>
            <div className="relative">
              <input
                className="w-full bg-surface border border-outline rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:border-secondary transition-colors text-body-lg font-body-lg"
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <span className="absolute left-3 top-3.5 text-outline pointer-events-none text-body-lg font-body-lg select-none">
                {settings.currency}
              </span>
            </div>
          </div>

          {/* Radio Status Group - Custom toggles that match the design mockups */}
          <div className="flex flex-col gap-4 pt-2">
            {/* Payment Status Toggle */}
            <div
              onClick={() => setPaymentStatus(paymentStatus === 'done' ? 'pending' : 'done')}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer select-none transition-all duration-200 ${
                paymentStatus === 'done'
                  ? 'bg-secondary-container/20 border-secondary'
                  : 'bg-surface-container-low border-outline-variant hover:border-outline'
              }`}
            >
              <span className="font-label-caps text-label-caps text-primary">PAYMENT</span>
              <div className="flex items-center gap-2">
                <span className={`text-body-md font-bold transition-colors ${paymentStatus === 'done' ? 'text-secondary' : 'text-on-surface-variant'}`}>
                  Done
                </span>
                <span className={`material-symbols-outlined transition-all ${paymentStatus === 'done' ? 'text-secondary font-bold scale-110' : 'text-outline'}`}>
                  {paymentStatus === 'done' ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </div>
            </div>

            {/* Courier Status Toggle */}
            <div
              onClick={() => setCourierStatus(courierStatus === 'done' ? 'pending' : 'done')}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer select-none transition-all duration-200 ${
                courierStatus === 'done'
                  ? 'bg-secondary-container/20 border-secondary'
                  : 'bg-surface-container-low border-outline-variant hover:border-outline'
              }`}
            >
              <span className="font-label-caps text-label-caps text-primary">SENT COURIER</span>
              <div className="flex items-center gap-2">
                <span className={`text-body-md font-bold transition-colors ${courierStatus === 'done' ? 'text-secondary' : 'text-on-surface-variant'}`}>
                  Done
                </span>
                <span className={`material-symbols-outlined transition-all ${courierStatus === 'done' ? 'text-secondary font-bold scale-110' : 'text-outline'}`}>
                  {courierStatus === 'done' ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </div>
            </div>

            {/* Order Received Status Toggle */}
            <div
              onClick={() => setOrderStatus(orderStatus === 'done' ? 'pending' : 'done')}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer select-none transition-all duration-200 ${
                orderStatus === 'done'
                  ? 'bg-secondary-container/20 border-secondary'
                  : 'bg-surface-container-low border-outline-variant hover:border-outline'
              }`}
            >
              <span className="font-label-caps text-label-caps text-primary">ORDER RECEIVED</span>
              <div className="flex items-center gap-2">
                <span className={`text-body-md font-bold transition-colors ${orderStatus === 'done' ? 'text-secondary' : 'text-on-surface-variant'}`}>
                  Done
                </span>
                <span className={`material-symbols-outlined transition-all ${orderStatus === 'done' ? 'text-secondary font-bold scale-110' : 'text-outline'}`}>
                  {orderStatus === 'done' ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          className="w-full bg-primary text-on-primary h-14 rounded-lg flex items-center justify-center gap-2 active:scale-[0.98] hover:opacity-90 transition-all shadow-md mt-2 font-bold cursor-pointer"
          type="submit"
        >
          <span className="material-symbols-outlined">save</span>
          <span className="font-body-lg">Save Data Entry</span>
        </button>
      </form>
    </div>
  );
}

export default EntryForm;
