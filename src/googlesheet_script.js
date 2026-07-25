function doPost(e) {
    try {
        var data = JSON.parse(e.postData.contents);
        var ss = SpreadsheetApp.getActiveSpreadsheet();

        // Connection test handler
        if (data.type === 'ping') {
            return ContentService.createTextOutput("pong");
        }

        // Inventory List Sync Handler (Writes to "Inventory" tab)
        if (data.type === 'inventory_sync') {
            var sheet = ss.getSheetByName("Inventory") || ss.insertSheet("Inventory");
            sheet.clear(); // Clear all existing items to perform a fresh sync

            // Append headers
            sheet.appendRow(["ID", "SKU", "Product Name", "Unit Price"]);

            if (data.items && data.items.length > 0) {
                var rows = data.items.map(function (item) {
                    return [item.id, item.sku, item.name, item.price];
                });
                // Batch write rows for fast execution
                sheet.getRange(2, 1, rows.length, 4).setValues(rows);
            }
            return ContentService.createTextOutput("success");
        }

        // Sales ledger entry handler (Writes to the default first tab)
        else {
            var sheet = ss.getSheets()[0];
            sheet.appendRow([
                data.date,                // Column A: Date
                data.id,                  // Column B: Transaction ID
                data.customerName,        // Column C: Customer Name
                data.productName,         // Column D: Product
                data.paymentStatus,       // Column E: Payment Status
                'Wholesaler name',        // Column F: Wholesaler name (placeholder)
                data.orderStatus,         // Column G: Order Status
                data.courierStatus,       // Column H: Courier Status
                'Customer Received',      // Column I: Customer Received (placeholder)
                'Wholesaler price',       // Column J: Wholesaler price (placeholder)
                data.price,               // Column K: Saaj Price
                'Courier charges',        // Column L: Courier Charge (placeholder)
                'Courier status',         // Column M: Courier Status (placeholder)
                'net profit',             // Column N: Net Profit (placeholder)
                data.contactNo,           // Column O: Contact Number
                data.address,             // Column P: Address
                data.pincode || 'N/A'     // Column Q: Pincode
            ]);
            return ContentService.createTextOutput("success");
        }
    } catch (error) {
        return ContentService.createTextOutput("Error: " + error.toString());
    }
}