import React, { useState } from 'react';

const SENDER_DETAILS = {
  name: 'Saaj Creation and Jewellery',
  address: 'A-504, Delta Tower 1, Sec-8, Ulwe, Navi Mumbai 410206',
  mobile: '9136603650'
};

function PrintLabels({ showToast }) {
  const [recipients, setRecipients] = useState([
    { name: '', mobile: '', address: '', pincode: '' }
  ]);

  const handleAddRecipient = () => {
    if (recipients.length >= 4) {
      showToast('Maximum 4 recipients allowed.', 'warning');
      return;
    }
    setRecipients([...recipients, { name: '', mobile: '', address: '', pincode: '' }]);
  };

  const handleRemoveRecipient = (index) => {
    if (recipients.length <= 1) {
      showToast('At least one recipient is required.', 'warning');
      return;
    }
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...recipients];
    updated[index][field] = value;
    setRecipients(updated);
  };

  const handleClearAll = () => {
    setRecipients([{ name: '', mobile: '', address: '', pincode: '' }]);
    showToast('All recipient entries cleared.');
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to split address into exactly 5 lines for the printed label table
  const getAddressLines = (addressStr) => {
    const lines = addressStr ? addressStr.split('\n') : [];
    while (lines.length < 5) {
      lines.push('');
    }
    return lines.slice(0, 5);
  };

  // Always pad recipients to 4 for the 2x2 print grid
  const paddedRecipients = [...recipients];
  while (paddedRecipients.length < 4) {
    paddedRecipients.push({ name: '', mobile: '', address: '', pincode: '' });
  }

  return (
    <div className="w-full">
      {/* CSS overrides for print style */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            /* Hide page headers, footers, navigation and screen-only elements */
            header, nav, .print\\:hidden, button, .no-print {
              display: none !important;
            }
            
            /* Reset body and root spacing and force user readable sans-serif font */
            body, #root, #root > div {
              background: white !important;
              color: black !important;
              padding: 0 !important;
              margin: 0 !important;
              min-height: auto !important;
              font-family: Arial, Helvetica, sans-serif !important;
            }
            
            table, td, th {
              font-family: Arial, Helvetica, sans-serif !important;
            }

            /* Stylish serif font for the brand header when printing */
            .print-brand-header {
              font-family: 'Noto Serif', Georgia, 'Times New Roman', serif !important;
              font-style: italic !important;
              font-size: 18px !important;
              letter-spacing: 0.03em !important;
              font-weight: 700 !important;
            }
            
            main {
              padding: 0 !important;
              margin: 0 !important;
              max-width: none !important;
              background: white !important;
            }

            /* Configure print orientation to A4 landscape (Horizontal) and remove browser headers/footers */
            @page {
              size: A4 landscape;
              margin: 0;
            }

            /* Container for 2x2 grid fitting exactly 297mm x 210mm */
            .print-container {
              display: grid !important;
              grid-template-columns: 1fr 1fr;
              grid-template-rows: 1fr 1fr;
              gap: 6mm;
              width: 297mm;
              height: 210mm;
              padding: 8mm;
              box-sizing: border-box;
              background: white !important;
              page-break-inside: avoid;
            }
            
            .print-label-card {
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              background: white !important;
            }
          }
        `
      }} />

      {/* Screen Interface (Hidden when printing) */}
      <div className="print:hidden flex flex-col gap-6 animate-fadeIn w-full">
        {/* Page Header */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <span className="font-label-caps text-label-caps text-on-tertiary-container uppercase tracking-wider text-[11px]">
              Operations / Shipping
            </span>
            <h2 className="font-headline-md text-3xl font-bold font-headline text-primary mt-1">
              Bulk Address Entry
            </h2>
            <p className="text-on-surface-variant text-sm mt-2 leading-relaxed font-bold text-secondary">
              Maximum 4 shipping labels allowed.
            </p>
          </div>
          {recipients.length < 4 && (
            <button
              onClick={handleAddRecipient}
              className="self-start md:self-center bg-secondary text-white font-bold h-11 px-5 rounded-full flex items-center gap-2 hover:opacity-90 active:scale-[0.97] transition-all cursor-pointer shadow-sm text-sm"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Add Recipient
            </button>
          )}
        </header>

        {/* Recipient Form Cards list */}
        <div className="flex flex-col gap-6">
          {recipients.map((recipient, index) => (
            <div
              key={index}
              className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant relative flex flex-col gap-5 shadow-sm"
            >
              {/* Card Header */}
              <div className="flex justify-between items-center border-b border-outline-variant/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">local_shipping</span>
                  <h3 className="font-headline-sm text-lg font-bold text-primary">Shipping Details</h3>
                </div>
                <div className="flex items-center gap-2">
                  {recipients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRecipient(index)}
                      className="text-error hover:bg-error-container/20 p-1.5 rounded-full transition-colors active:scale-95 cursor-pointer mr-1"
                      title="Remove Recipient"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  )}
                  <span className="bg-[#fed488] text-[#785a1a] font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                    Recipient {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="font-label-caps text-label-caps text-on-surface-variant text-[11px] font-bold">FULL NAME</label>
                  <input
                    type="text"
                    className="bg-surface border border-outline rounded-lg px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-body-lg font-body"
                    placeholder="Enter full name"
                    value={recipient.name}
                    onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                  />
                </div>

                {/* Mobile Number */}
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="font-label-caps text-label-caps text-on-surface-variant text-[11px] font-bold">MOBILE NUMBER</label>
                  <input
                    type="text"
                    className="bg-surface border border-outline rounded-lg px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-body-lg font-body"
                    placeholder="Enter mobile number"
                    value={recipient.mobile}
                    onChange={(e) => handleFieldChange(index, 'mobile', e.target.value)}
                  />
                </div>

                {/* Full Address */}
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="font-label-caps text-label-caps text-on-surface-variant text-[11px] font-bold">FULL ADDRESS</label>
                  <textarea
                    rows={3}
                    className="bg-surface border border-outline rounded-lg px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-body-md font-body resize-none"
                    placeholder="Enter full address (use newlines to separate rows on the label)"
                    value={recipient.address}
                    onChange={(e) => handleFieldChange(index, 'address', e.target.value)}
                  />
                </div>

                {/* Pincode & Status */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant text-[11px] font-bold">PINCODE</label>
                  <input
                    type="text"
                    className="bg-surface border border-outline rounded-lg px-4 py-3 focus:outline-none focus:border-secondary transition-colors text-body-lg font-body"
                    placeholder="Enter pincode"
                    value={recipient.pincode}
                    onChange={(e) => handleFieldChange(index, 'pincode', e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 text-outline text-xs h-full pt-5">
                  <span className="material-symbols-outlined text-sm text-secondary font-bold">check_circle</span>
                  <span className="font-label-caps uppercase tracking-wider text-[10px] font-bold text-on-surface-variant/80">Label Preview Verified</span>
                </div>
              </div>

              {/* Sender Info Footer */}
              <div className="border-t border-dashed border-outline-variant/80 pt-4 mt-1 flex justify-between items-end">
                <div className="flex flex-col gap-0.5">
                  <span className="font-label-caps text-[9px] text-secondary uppercase tracking-wider font-bold">From</span>
                  <span className="font-bold text-sm text-primary">Saaj Creation And Jewellery</span>
                  <span className="text-xs text-on-surface-variant leading-tight">Navi Mumbai, 410206</span>
                </div>
                <div className="bg-[#d3e4fe] p-2.5 rounded-lg flex items-center justify-center opacity-85">
                  <span className="material-symbols-outlined text-primary text-xl">qr_code_2</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Add Recipient Button */}
        {recipients.length < 4 && (
          <button
            onClick={handleAddRecipient}
            className="w-full border-2 border-dashed border-outline-variant hover:border-secondary hover:text-secondary text-on-surface-variant font-bold h-14 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer bg-surface-container-lowest/50 hover:bg-surface-container-lowest active:scale-[0.99] text-sm mt-2"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add Recipient
          </button>
        )}

        {/* Ready for Dispatch Footer Section */}
        <div className="bg-[#131b2e] text-white p-6 rounded-xl border border-outline-variant/30 flex flex-col gap-4 shadow-md mt-2 mb-10">
          <h3 className="font-headline text-xl text-center font-bold text-[#fed488] tracking-tight">Ready for Dispatch?</h3>
          <p className="text-center text-xs text-slate-300 -mt-2">
            Review all {recipients.length} {recipients.length === 1 ? 'entry' : 'entries'} before final printing.
          </p>
          <div className="flex gap-4 w-full mt-1">
            <button
              onClick={handleClearAll}
              className="flex-1 border border-slate-500 hover:bg-white/10 active:scale-[0.98] transition-all text-white font-bold h-12 rounded-lg flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <span className="material-symbols-outlined text-lg">clear_all</span>
              Clear All
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 bg-[#fed488] text-[#261900] hover:bg-[#fed488]/90 active:scale-[0.98] transition-all font-bold h-12 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-md text-sm"
            >
              <span className="material-symbols-outlined text-lg">print</span>
              Print Labels
            </button>
          </div>
        </div>
      </div>

      {/* Print-Only Layout (Visible when printing, hidden on screen) */}
      <div className="print-container hidden print:grid">
        {paddedRecipients.map((recipient, index) => {
          const addressLines = getAddressLines(recipient.address);
          return (
            <div key={index} className="print-label-card">
              <table className="w-full h-full border-collapse border-2 border-black font-body text-black bg-white">
                <thead>
                  <tr>
                    <th colSpan="2" className="border-b-2 border-black text-center py-1 text-base font-bold uppercase tracking-wider print-brand-header">
                      Saaj Creation And Jewellery
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* To Row */}
                  <tr className="border-b border-black">
                    <td className="border-r border-black font-bold px-3 py-0.5 text-xs w-[18%] align-middle leading-tight">To : Name</td>
                    <td className="px-3 py-0.5 text-sm font-bold w-[82%] align-middle leading-tight">{recipient.name || ''}</td>
                  </tr>
                  
                  {/* Address Line 1 */}
                  <tr className="border-b border-black">
                    <td className="border-r border-black font-bold px-3 py-0.5 text-xs align-middle leading-tight">Address</td>
                    <td className="px-3 py-0.5 text-sm font-bold align-middle leading-tight">{addressLines[0]}</td>
                  </tr>
                  
                  {/* Address Line 2 */}
                  <tr className="border-b border-black">
                    <td className="border-r border-black px-3 py-0.5 text-xs align-middle leading-tight"></td>
                    <td className="px-3 py-0.5 text-sm font-bold align-middle leading-tight">{addressLines[1]}</td>
                  </tr>
                  
                  {/* Address Line 3 */}
                  <tr className="border-b border-black">
                    <td className="border-r border-black px-3 py-0.5 text-xs align-middle leading-tight"></td>
                    <td className="px-3 py-0.5 text-sm font-bold align-middle leading-tight">{addressLines[2]}</td>
                  </tr>
                  
                  {/* Address Line 4 */}
                  <tr className="border-b border-black">
                    <td className="border-r border-black px-3 py-0.5 text-xs align-middle leading-tight"></td>
                    <td className="px-3 py-0.5 text-sm font-bold align-middle leading-tight">{addressLines[3]}</td>
                  </tr>
                  
                  {/* Address Line 5 */}
                  <tr className="border-b border-black">
                    <td className="border-r border-black px-3 py-0.5 text-xs align-middle leading-tight"></td>
                    <td className="px-3 py-0.5 text-sm font-bold align-middle leading-tight">{addressLines[4]}</td>
                  </tr>
                  
                  {/* Pincode Row */}
                  <tr className="border-b border-black">
                    <td className="border-r border-black font-bold px-3 py-0.5 text-xs align-middle leading-tight">PinCode</td>
                    <td className="px-3 py-0.5 text-sm font-bold align-middle leading-tight">{recipient.pincode || ''}</td>
                  </tr>
                  
                  {/* Mobile Row */}
                  <tr className="border-b border-black">
                    <td className="border-r border-black font-bold px-3 py-0.5 text-xs align-middle leading-tight">Mobile</td>
                    <td className="px-3 py-0.5 text-sm font-bold align-middle leading-tight">{recipient.mobile || ''}</td>
                  </tr>
                  
                  {/* Sender Details Rows */}
                  <tr className="border-b border-black">
                    <td className="border-r border-black font-bold px-3 py-0.5 text-xs align-middle leading-tight">From :</td>
                    <td className="px-3 py-0.5 text-xs font-bold align-middle leading-tight">{SENDER_DETAILS.name}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border-r border-black px-3 py-0.5 text-xs align-middle leading-tight"></td>
                    <td className="px-3 py-0.5 text-[10px] leading-tight align-middle">{SENDER_DETAILS.address}</td>
                  </tr>
                  <tr>
                    <td className="border-r border-black px-3 py-0.5 text-xs align-middle leading-tight"></td>
                    <td className="px-3 py-0.5 text-xs font-bold align-middle leading-tight">{SENDER_DETAILS.mobile}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PrintLabels;
