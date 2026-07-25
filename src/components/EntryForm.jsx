import React, { useState, useEffect } from 'react';

const callGeminiAutofill = async (text) => {
  const apiKey = "AQ.Ab8RN6JkJuvpWUFDKEkJQK1ZwFpe8s9yAoGN2vKYpHadW4j8Ew";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
You are an expert data parsing assistant. Extract the contact details from the following raw text and structure it as JSON.
- "customerName": Clean name of the person/customer (exclude phone numbers, pincodes, or address terms).
- "contactNo": Mapped phone/mobile number (digits only or standard + country code format, e.g., 9372889289).
- "address": The complete delivery address exactly as written in the text (including street, nearby landmarks, district, building name, flat number, society, etc.), excluding only the pincode/zipcode. Do not summarize, shorten, or omit any qualifiers or words in this field.
- "pincode": The 6-digit or postal pincode.

Text to parse:
"""
${text}
"""

Format the output strictly as a JSON object with keys: "customerName", "contactNo", "address", "pincode". Do not output markdown, backticks, or any other description. Output only raw JSON.
  `;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!responseText) {
    throw new Error('Empty response from Gemini');
  }

  return JSON.parse(responseText.trim());
};

function EntryForm({ sales, setSales, inventory, setInventory, settings, showToast, syncSaleToGoogleSheet }) {
  const [pincode, setPincode] = useState('');
  const [showAutofill, setShowAutofill] = useState(false);
  const [autofillText, setAutofillText] = useState('');
  const [isAutofilling, setIsAutofilling] = useState(false);
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

    // Add new sale
    const newSale = {
      id,
      date,
      customerName: customerName.trim(),
      contactNo: contactNo.trim() || 'N/A',
      address: address.trim() || 'N/A',
      pincode: pincode.trim() || 'N/A',
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
    setPincode('');
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

  const handleAutofillSubmit = async () => {
    if (!autofillText.trim()) {
      showToast('Please enter some text to autofill.', 'warning');
      return;
    }

    setIsAutofilling(true);
    showToast('AI is parsing details...');

    try {
      const result = await callGeminiAutofill(autofillText);
      if (result) {
        if (result.customerName) setCustomerName(result.customerName);
        if (result.contactNo) setContactNo(result.contactNo);
        if (result.address) setAddress(result.address);
        if (result.pincode) setPincode(result.pincode);
        showToast('Form autofilled successfully!');
        setShowAutofill(false);
        setAutofillText('');
      } else {
        showToast('AI was unable to extract details. Please check text or try again.', 'warning');
      }
    } catch (err) {
      console.error(err);
      showToast('Autofill failed. Check internet connection or API Key.', 'warning');
    } finally {
      setIsAutofilling(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-8 w-full animate-fadeIn">
      {/* Hero Header */}
      <header>
        <span className="font-label-caps text-label-caps text-on-tertiary-container uppercase">Operational Suite</span>
        <h2 className="font-headline-md text-headline-md text-primary mt-1">Data Entry</h2>
      </header>

      {/* AI Autofill Panel */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setShowAutofill(!showAutofill)}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-secondary/30 bg-secondary-container/10 text-secondary hover:bg-secondary-container/20 transition-all font-bold text-xs font-label-caps tracking-wider cursor-pointer active:scale-[0.98] mr-auto shadow-sm"
        >
          <span className="material-symbols-outlined text-sm font-bold">auto_awesome</span>
          <span>{showAutofill ? 'Close AI Autofill' : 'AI Autofill (Magic Button)'}</span>
        </button>

        {showAutofill && (
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-secondary/30 flex flex-col gap-3 animate-fadeIn shadow-md">
            <span className="font-label-caps text-label-caps text-secondary font-bold">Paste Raw Customer Details</span>
            <textarea
              className="bg-surface border border-outline rounded-lg px-3 py-2.5 focus:outline-none focus:border-secondary transition-colors text-body-md font-body resize-none w-full"
              placeholder="Example: Siddhesh Divekar 9372889289 Delta Tower 1,Ulwe ,Navi Mumbai 410206"
              rows="3"
              value={autofillText}
              onChange={(e) => setAutofillText(e.target.value)}
              disabled={isAutofilling}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAutofillSubmit}
                disabled={isAutofilling}
                className="bg-secondary text-white px-4 py-2 rounded-lg font-bold text-xs font-label-caps tracking-wider cursor-pointer hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAutofilling ? (
                  <>
                    <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                    Parsing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xs">auto_awesome</span>
                    Autofill Form
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAutofill(false);
                  setAutofillText('');
                }}
                disabled={isAutofilling}
                className="border border-outline-variant hover:bg-surface text-on-surface-variant px-4 py-2 rounded-lg font-bold text-xs font-label-caps tracking-wider cursor-pointer active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

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

          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps text-on-surface-variant">PINCODE</label>
            <input
              className="bg-surface border border-outline rounded-lg px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-body-lg font-body-lg"
              placeholder="e.g. 400001"
              type="text"
              maxLength="8"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
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
                  <option key={item.id} value={item.id}>
                    {item.name} ({settings.currency}{item.price})
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
