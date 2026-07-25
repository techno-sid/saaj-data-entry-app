function doPost(e) {
    try {
        var data = JSON.parse(e.postData.contents);
        var ss = SpreadsheetApp.getActiveSpreadsheet();

        // Connection test handler
        if (data.type === 'ping') {
            return ContentService.createTextOutput("pong");
        }

        // Gemini AI Autofill proxy handler
        if (data.type === 'gemini_autofill') {
            var apiKey = "AQ.Ab8RN6LkGftBmc60a_PcqjNNKulwMZyDpXrZdam8M9vgxmNUfA";
            var models = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash'];
            var prompt = 'You are an expert data parsing assistant. Extract the contact details from the following raw text and structure it as JSON.\n' +
                '- "customerName": Clean name of the person/customer (exclude phone numbers, pincodes, or address terms).\n' +
                '- "contactNo": Mapped phone/mobile number (digits only or standard + country code format, e.g., 9372889289).\n' +
                '- "address": The complete delivery address exactly as written in the text (including street, nearby landmarks, district, building name, flat number, society, etc.), excluding only the pincode/zipcode. Do not summarize, shorten, or omit any qualifiers or words in this field.\n' +
                '- "pincode": The 6-digit or postal pincode.\n\n' +
                'Text to parse:\n"""\n' + data.text + '\n"""\n\n' +
                'Format the output strictly as a JSON object with keys: "customerName", "contactNo", "address", "pincode". Do not output markdown, backticks, or any other description. Output only raw JSON.';

            var lastError = "";
            for (var i = 0; i < models.length; i++) {
                try {
                    var modelName = models[i];
                    var url = "https://generativelanguage.googleapis.com/v1/models/" + modelName + ":generateContent?key=" + apiKey;
                    var payload = {
                        contents: [{
                            parts: [{ text: prompt }]
                        }],
                        generationConfig: {
                            responseMimeType: "application/json"
                        }
                    };
                    var options = {
                        method: "post",
                        contentType: "application/json",
                        payload: JSON.stringify(payload),
                        muteHttpExceptions: true
                    };
                    var response = UrlFetchApp.fetch(url, options);
                    var responseCode = response.getResponseCode();
                    var responseText = response.getContentText();
                    
                    if (responseCode === 200) {
                        return ContentService.createTextOutput(responseText);
                    } else {
                        lastError = "Model " + modelName + " failed (status " + responseCode + "): " + responseText;
                    }
                } catch (err) {
                    lastError = "Fetch error for model " + models[i] + ": " + err.toString();
                }
            }
            return ContentService.createTextOutput(JSON.stringify({ error: lastError }));
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