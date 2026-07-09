import React, { useState } from 'react';

function InventoryList({ inventory, setInventory, settings, showToast }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const openAddForm = () => {
    setName('');
    setSku('');
    setPrice('');
    setStock('');
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setName(item.name);
    setSku(item.sku);
    setPrice(item.price.toString());
    setStock(item.stock.toString());
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please enter product name.', 'warning');
      return;
    }
    if (!sku.trim()) {
      showToast('Please enter SKU.', 'warning');
      return;
    }

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      showToast('Please enter a valid price.', 'warning');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      showToast('Please enter a valid stock level.', 'warning');
      return;
    }

    // Check SKU uniqueness (exclude the current item we are editing)
    const isSkuTaken = inventory.some(item => 
      item.sku.toLowerCase() === sku.trim().toLowerCase() && 
      (!editingItem || item.id !== editingItem.id)
    );

    if (isSkuTaken) {
      showToast(`SKU '${sku}' is already assigned to another product.`, 'warning');
      return;
    }

    if (editingItem) {
      // Edit mode
      const updated = inventory.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            name: name.trim(),
            sku: sku.trim().toUpperCase(),
            price: priceNum,
            stock: stockNum
          };
        }
        return item;
      });
      setInventory(updated);
      showToast(`Product ${name} updated successfully.`);
    } else {
      // Add mode
      const newProduct = {
        id: Date.now().toString(),
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        price: priceNum,
        stock: stockNum
      };
      setInventory([...inventory, newProduct]);
      showToast(`Product ${name} added to inventory.`);
    }

    setIsFormOpen(false);
  };

  const handleDeleteProduct = (itemId, itemName) => {
    if (window.confirm(`Are you sure you want to delete ${itemName} from inventory?`)) {
      const updated = inventory.filter(item => item.id !== itemId);
      setInventory(updated);
      showToast(`Product ${itemName} removed.`, 'warning');
    }
  };

  // Helper for stock badge
  const renderStockBadge = (stockLevel) => {
    if (stockLevel === 0) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-label-caps bg-[#ffdad6] text-[#ba1a1a] uppercase">
          Out of Stock
        </span>
      );
    } else if (stockLevel <= 5) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-label-caps bg-[#ffdea5] text-[#785a1a] uppercase">
          Low Stock ({stockLevel})
        </span>
      );
    } else {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-label-caps bg-[#d1e7dd] text-[#0f5132] uppercase">
          In Stock ({stockLevel})
        </span>
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn max-w-4xl mx-auto">
      {/* Hero Header */}
      <header className="flex justify-between items-end">
        <div>
          <span className="font-label-caps text-label-caps text-on-tertiary-container uppercase">Operational Suite</span>
          <h2 className="font-headline-md text-headline-md text-primary mt-1">Inventory Ledger</h2>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-lg text-body-md hover:opacity-90 transition-all font-bold cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Item
        </button>
      </header>

      {/* Inventory Table (Desktop View) / Cards (Mobile View) */}
      <div className="w-full">
        {inventory.length === 0 ? (
          <div className="bg-surface-container-lowest p-8 text-center rounded-xl border border-outline-variant">
            <span className="material-symbols-outlined text-outline text-4xl mb-2">inventory_2</span>
            <p className="text-on-surface-variant text-body-lg font-bold">Inventory is empty</p>
            <p className="text-outline text-xs mt-1">Add your first jewelry product using the "Add Item" button.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
              <table className="w-full border-collapse text-left text-body-md">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low">
                    <th className="font-label-caps text-label-caps text-on-surface-variant p-4">SKU</th>
                    <th className="font-label-caps text-label-caps text-on-surface-variant p-4">Product Name</th>
                    <th className="font-label-caps text-label-caps text-on-surface-variant p-4 text-right">Unit Price</th>
                    <th className="font-label-caps text-label-caps text-on-surface-variant p-4 text-center">Stock Level</th>
                    <th className="font-label-caps text-label-caps text-on-surface-variant p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-outline-variant hover:bg-surface-container-low/55 transition-colors"
                    >
                      <td className="p-4 font-bold text-primary">{item.sku}</td>
                      <td className="p-4 font-bold">{item.name}</td>
                      <td className="p-4 font-bold text-right text-primary">
                        {settings.currency}{Number(item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-center">{renderStockBadge(item.stock)}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditForm(item)}
                            className="p-1 hover:bg-surface-variant rounded text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                            title="Edit product info"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(item.id, item.name)}
                            className="p-1 hover:bg-[#ffdad6] rounded text-error hover:text-[#93000a] transition-colors cursor-pointer"
                            title="Delete product"
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
              {inventory.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex flex-col gap-4 shadow-sm hover:border-outline transition-colors"
                >
                  <div className="flex justify-between items-center border-b border-outline-variant pb-2">
                    <span className="font-bold text-primary text-body-lg">{item.sku}</span>
                    {renderStockBadge(item.stock)}
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <span className="font-label-caps text-on-surface-variant block uppercase text-[10px] mb-0.5">Product Name</span>
                      <span className="font-bold text-primary text-base">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-label-caps text-on-surface-variant block uppercase text-[10px] mb-0.5">Price</span>
                      <span className="font-bold text-primary text-base">
                        {settings.currency}{Number(item.price).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-1 border-t border-outline-variant/60 pt-2">
                    <button
                      onClick={() => openEditForm(item)}
                      className="flex items-center gap-1 text-xs text-secondary font-bold font-label-caps cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      Edit Product
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(item.id, item.name)}
                      className="flex items-center gap-1 text-xs text-error font-bold font-label-caps cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSubmit}
            className="bg-surface-container-lowest max-w-md w-full rounded-xl border border-outline-variant p-6 shadow-xl flex flex-col gap-5 animate-slideUp"
          >
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">
                  {editingItem ? 'edit_note' : 'add_circle'}
                </span>
                <h3 className="font-headline-sm text-headline-sm text-primary">
                  {editingItem ? 'Edit Product' : 'Add New Product'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 hover:bg-surface-variant rounded-full text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-4 text-body-md">
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant">PRODUCT NAME</label>
                <input
                  className="bg-surface border border-outline rounded-lg px-4 py-2.5 focus:outline-none focus:border-secondary transition-colors text-body-lg font-body"
                  placeholder="e.g. Sapphire Ring"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant">SKU CODE</label>
                <input
                  className="bg-surface border border-outline rounded-lg px-4 py-2.5 focus:outline-none focus:border-secondary transition-colors text-body-lg font-body uppercase"
                  placeholder="e.g. SR-005"
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant">PRICE ({settings.currency})</label>
                  <input
                    className="bg-surface border border-outline rounded-lg px-4 py-2.5 focus:outline-none focus:border-secondary transition-colors text-body-lg font-body"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant">INITIAL STOCK</label>
                  <input
                    className="bg-surface border border-outline rounded-lg px-4 py-2.5 focus:outline-none focus:border-secondary transition-colors text-body-lg font-body"
                    placeholder="0"
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-2 border-t border-outline-variant pt-4">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 border border-outline hover:bg-surface-variant rounded-lg text-body-md font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary text-on-primary hover:opacity-90 rounded-lg text-body-md font-bold transition-all cursor-pointer"
              >
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default InventoryList;
