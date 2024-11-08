let db;

// Open or create the database
function openDB() {
    let request = indexedDB.open("MyDatabase", 1);

    request.onerror = function (event) {
        console.log("Error opening database:", event.target.error);
    };

    request.onsuccess = function (event) {
        db = event.target.result;
        displayData();
    };

    request.onupgradeneeded = function (event) {
        db = event.target.result;
        if (!db.objectStoreNames.contains("dataStore")) {
            db.createObjectStore("dataStore", { keyPath: "id", autoIncrement: true });
        }
    };
}

// Function to save data from the form to IndexedDB
function saveData() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    if (!name || !email || !message) return;

    let transaction = db.transaction(["dataStore"], "readwrite");
    let store = transaction.objectStore("dataStore");
    let request = store.add({ name: name, email: email, message: message });

    request.onsuccess = function () {
        console.log("Data saved");
        displayData();  // Refresh the displayed data
    };

    request.onerror = function (event) {
        console.log("Error saving data:", event.target.error);
    };
}

function updateData() {
    const id = parseInt(document.getElementById("id").value); // Get the ID from the input
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    if (!id || !name || !email || !message) {
        console.log("All fields, including ID, are required.");
        return;
    }

    let transaction = db.transaction(["dataStore"], "readwrite");
    let store = transaction.objectStore("dataStore");

    // Fetch the existing record by ID
    let request = store.get(id);

    request.onsuccess = function (event) {
        let data = event.target.result;

        if (data) {
            // Update fields
            data.name = name;
            data.email = email;
            data.message = message;

            // Put the updated data back into the object store
            let updateRequest = store.put(data);

            updateRequest.onsuccess = function () {
                console.log("Data updated successfully.");
                displayData();  // Refresh the displayed data
            };

            updateRequest.onerror = function (event) {
                console.log("Error updating data:", event.target.error);
            };
        } else {
            console.log("Record not found for the specified ID.");
        }
    };

    request.onerror = function (event) {
        console.log("Error retrieving data:", event.target.error);
    };
}


// Function to display data from IndexedDB
function displayData() {
    const dataList = document.getElementById("dataList");
    dataList.innerHTML = "";

    let transaction = db.transaction(["dataStore"], "readonly");
    let store = transaction.objectStore("dataStore");

    store.openCursor().onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            let listItem = document.createElement("li");
            listItem.textContent = `Name: ${cursor.value.name}, Email: ${cursor.value.email}, Message: ${cursor.value.message}`;
            dataList.appendChild(listItem);
            cursor.continue();
        }
    };
}

// Initialize the IndexedDB
openDB();
