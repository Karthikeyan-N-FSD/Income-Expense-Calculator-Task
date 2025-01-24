const apiURL = "https://67718955ee76b92dd48ff519.mockapi.io/transaction";
let isEdit = false;
let currentId = null;

async function addEntry() {
    try {
        let description = document.getElementById("description").value;
        let amount = document.getElementById("amount").value;
        let type = document.getElementById("type").value;
        let date = document.getElementById("date").value;
        if (!description || !amount || !type || !date) {
            alert("Please fill all the fields");
            return;
        }
        let entry = {
            description: description,
            amount: parseInt(amount),
            type: type,
            date: date
        };

        if (isEdit) {
            await editEntry(currentId, entry);
        } else {
            await fetch(apiURL, {
                method: "POST",
                body: JSON.stringify(entry),
                headers: {
                    "Content-type": "application/json"
                }
            });
        }
        fetchEntries();
        document.getElementById("description").value = "";
        document.getElementById("amount").value = "";
        document.getElementById("type").value = "";
        document.getElementById("date").value = "";
    } catch (error) {
        alert("Entry Not Added")
    }
}

async function fetchEntries() {
    try {
        let response = await fetch(apiURL);
        let datas = await response.json();
        let fliterDatas = datas;
        datas.sort((a, b) => new Date(a.date) - new Date(b.date));

        let filter = document.querySelector('input[name="filter"]:checked').value;
        if (filter !== 'all') {
            fliterDatas = datas.filter(data => data.type === filter);
        }
        let entriesList = document.getElementById("entries-list");
        if (fliterDatas.length == 0) {
            entriesList.innerHTML = "No transaction avilable";
            return;
        }
        entriesList.innerHTML = "";
        fliterDatas.forEach((data, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
            <td class="border border-gray-900">${index + 1}</td>
            <td class="border border-gray-900">${data.date}</td>
            <td class="border border-gray-900">${data.description}</td>
            <td class="border border-gray-900">₹${data.amount}</td>
            <td class="border border-gray-900">${data.type}</td>
             <td class="border border-gray-900 text-center">
                <button class="px-1 py-0.5 bg-yellow-500 rounded" onclick="getEntryById(${data.id})">Edit</button>
                <button class="px-1 py-0.5 bg-red-500 rounded" onclick="deleteEntry(${data.id})">Delete</button>
           </td>`;
            entriesList.appendChild(tr);
        });
        calculation(datas);
    } catch (error) {
        alert("No Transaction Found / Unable to Fetch Transaction");
    }
}

function calculation(datas) {
    let totalIncome = 0;
    let totalExpenses = 0;
    datas.forEach(data => {
        if (data.type === 'income') {
            totalIncome += data.amount;
        } else {
            totalExpenses += data.amount;
        }
    });
    let netBalance = totalIncome - totalExpenses;


    document.getElementById("total-income").textContent = `₹${totalIncome}`;
    document.getElementById("total-expenses").textContent = `₹${totalExpenses}`;
    document.getElementById("net-balance").textContent = `₹${netBalance}`;
}

async function getEntryById(id) {
    try {
        let resp = await fetch(`${apiURL}/${id}`);
        let data = await resp.json();
        document.getElementById("description").value = data.description;
        document.getElementById("amount").value = data.amount;
        document.getElementById("type").value = data.type;
        document.getElementById("date").value = data.date;

        isEdit = true;
        currentId = id;
        document.getElementById("add-btn").innerText = "Update";
    } catch (error) {
        alert("Unable to edit transaction", error);
    }
}
async function editEntry(id, updatedEntry) {
    try {
        await fetch(`${apiURL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedEntry)
        });
        isEdit = false;
        currentId = null;
        document.getElementById("add-btn").textContent = "Add Entry";
    } catch (error) {
        alert("Failed to update entry", error);
    }
}
async function deleteEntry(id) {
    try {
        let resp = confirm("Are you sure do you want to delete this transaction?");
        if (resp) {
            await fetch(`${apiURL}/${id}`, { method: "DELETE" });
            fetchEntries();
        }
    } catch (error) {
        alert("Transaction not deleted", error);
    }
}

function clearFields() {
    document.getElementById("description").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("type").value = "";
    document.getElementById("date").value = "";
    isEdit = false;
    currentId = null;
    document.getElementById("add-btn").textContent = "Add Entry";
}

fetchEntries();