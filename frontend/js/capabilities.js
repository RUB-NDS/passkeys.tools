export const renderCapabilities = () => {
    if (!PublicKeyCredential || !PublicKeyCredential.getClientCapabilities) {
        console.error("PublicKeyCredential.getClientCapabilities is not supported in this browser.")
        document.getElementById("capabilities").innerHTML = "<p class='text-danger'>PublicKeyCredential.getClientCapabilities is not supported in this browser.</p>"
    } else {
        PublicKeyCredential.getClientCapabilities().then(capabilities => {
            console.info("PublicKeyCredential.getClientCapabilities:", capabilities)
            const table = document.createElement("table")
            table.classList.add("table", "table-striped", "table-bordered")
            const thead = document.createElement("thead")
            const headerRow = document.createElement("tr")
            const headerCol1 = document.createElement("th")
            headerCol1.textContent = "Capability"
            headerRow.appendChild(headerCol1)
            const headerCol2 = document.createElement("th")
            headerCol2.textContent = "Status"
            headerRow.appendChild(headerCol2)
            thead.appendChild(headerRow)
            table.appendChild(thead)
            const tbody = document.createElement("tbody")
            for (const [capability, supported] of Object.entries(capabilities)) {
                const row = document.createElement("tr")
                if (supported) row.classList.add("table-success")
                else row.classList.add("table-danger")
                const col1 = document.createElement("td")
                col1.textContent = capability
                row.appendChild(col1)
                const col2 = document.createElement("td")
                col2.textContent = supported ? "Supported" : "Not Supported"
                row.appendChild(col2)
                tbody.appendChild(row)
            }
            table.appendChild(tbody)
            const capabilitiesDiv = document.getElementById("capabilities")
            capabilitiesDiv.appendChild(table)
        })
    }
}
