// 'use strict'

// // Get a list of items in inventory based on the classification_id 
// let classificationList = document.querySelector("#classificationList")
// classificationList.addEventListener("change", function () {
//     let classification_id = classificationList.value
//     console.log(`classification_id is: ${classification_id}`)
//     let classIdURL = "/inv/getInventory/" + classification_id
//     fetch(classIdURL)
//         .then(function (response) {
//             if (response.ok) {
//                 return response.json();
//             }
//             throw Error("Network response was not OK");
//         })
//         .then(function (data) {
//             console.log(data);
//             buildInventoryList(data);
//         })
//         .catch(function (error) {
//             console.log('There was a problem: ', error.message)
//         })
// })


// // Build inventory items into HTML table components and inject into DOM 
// function buildInventoryList(data) {
//     let inventoryDisplay = document.getElementById("inventoryDisplay");
//     // Set up the table labels 
//     let dataTable = '<thead>';
//     dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>';
//     dataTable += '</thead>';
//     // Set up the table body 
//     dataTable += '<tbody>';
//     // Iterate over all vehicles in the array and put each in a row 
//     data.forEach(function (element) {
//         console.log(element.inv_id + ", " + element.inv_model);
//         dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`;
//         dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`;
//         dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`;
//     })
//     dataTable += '</tbody>';
//     // Display the contents in the Inventory Management view 
//     inventoryDisplay.innerHTML = dataTable;
// }

'use strict'

// Be tolerant to either id:
const select = document.getElementById('classificationList') || document.getElementById('classification_id')
const table = document.getElementById('inventoryDisplay')

console.log('[inv] select=', select?.id, 'table=', !!table)

function show(msg) { table.innerHTML = `<tbody><tr><td>${msg}</td></tr></tbody>` }

function buildInventoryList(data) {
    let html = '<thead><tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr></thead><tbody>'
    if (Array.isArray(data) && data.length) {
        html += data.map(v => `
      <tr>
        <td>${v.inv_make ?? ''} ${v.inv_model ?? ''}</td>
        <td><a href="/inv/edit/${v.inv_id}">Modify</a></td>
        <td><a href="/inv/delete/${v.inv_id}">Delete</a></td>
      </tr>`).join('')
    } else {
        html += `<tr><td colspan="3">No vehicles found for this classification.</td></tr>`
    }
    html += '</tbody>'
    table.innerHTML = html
}

async function load(id) {
    if (!id) return show('Choose a classification.')
    const url = `/inv/getInventory/${encodeURIComponent(id)}`
    console.log('[inv] fetching', url)
    try {
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
        const ct = res.headers.get('content-type') || ''
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        if (!ct.includes('application/json')) {
            const snippet = (await res.text()).slice(0, 200)
            console.error('[inv] expected JSON; got:', snippet)
            return show('Got HTML instead of JSON (are you logged in or is the route protected?)')
        }
        const data = await res.json()
        console.log('[inv] items:', Array.isArray(data) ? data.length : 'n/a')
        buildInventoryList(data)
    } catch (e) {
        console.error('[inv] error:', e)
        show('Error loading inventory.')
    }
}

select?.addEventListener('change', () => load(select.value))
if (select && select.value) load(select.value) // optional auto-load
