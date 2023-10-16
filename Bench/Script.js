// Retrieve rosterData from localStorage if available or initialize it
let rosterData = JSON.parse(localStorage.getItem("rosterData")) || [
    "Harodrim, DK, Unholy, 0",
];

let benchCounts = {}; // Initialize benchCounts

// Function to update benchCounts based on rosterData
function updateBenchCounts() {
    benchCounts = {}; // Reset benchCounts
    rosterData.forEach(row => {
        const rowData = row.split(', ');
        const name = rowData[0];
        const benchCount = parseInt(rowData[3]);
        benchCounts[name] = benchCount;
    });
}

updateBenchCounts(); // Initialize benchCounts based on rosterData

const maxDifference = 1; // Adjust this value as needed

console.log("Script.js is running");

document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.querySelector(".awesome-table tbody");
    const rollBenchButton = document.getElementById("rollBench");
    const chosenNameMessage = document.getElementById("chosenNameMessage");

    // Function to update the table and localStorage
    function updateTableAndStorage() {
        localStorage.setItem("rosterData", JSON.stringify(rosterData));
        
        if (!rosterData || rosterData.length === 0) {
            // Initialize rosterData with the default value
            rosterData = ["Harodrim, DK, Unholy, 0"];
        }

        tableBody.innerHTML = ''; // Clear the table
        rosterData.forEach(row => {
            const rowData = row.split(', ');
            const newRow = document.createElement("tr");

            rowData.forEach((cellData, index) => {
                const cell = document.createElement("td");
                cell.textContent = cellData;
                newRow.appendChild(cell);

                // If it's the last cell (Number of Bench), add a data attribute to track the count
                if (index === 3) {
                    newRow.setAttribute("data-bench-count", cellData);
                }

                // Add a "Decrement" button for each row
                if (index === 3) {
                    const decrementButton = document.createElement("button");
                    decrementButton.textContent = "Decrement";
                    decrementButton.addEventListener("click", function () {
                        const benchCount = parseInt(newRow.getAttribute("data-bench-count"));
                        if (benchCount > 0) {
                            newRow.setAttribute("data-bench-count", benchCount - 1);
                            newRow.cells[3].textContent = benchCount - 1;

                            // Update the rosterData array with the new count
                            const rowIndex = Array.from(tableBody.children).indexOf(newRow);
                            const rosterDataArray = rosterData[rowIndex].split(', ');
                            rosterDataArray[3] = (benchCount - 1).toString();
                            rosterData[rowIndex] = rosterDataArray.join(', ');

                            // Update the table and localStorage
                            updateTableAndStorage();
                        }
                    });

                    const buttonCell = document.createElement("td");
                    buttonCell.appendChild(decrementButton);
                    newRow.appendChild(buttonCell);

                    // Inside the loop that creates table rows
                    const deleteButton = document.createElement("button");
                    deleteButton.textContent = "Delete";
                    deleteButton.addEventListener("click", function () {
                        const rowIndex = Array.from(tableBody.children).indexOf(newRow);
                        rosterData.splice(rowIndex, 1); // Remove the row from rosterData
                        updateBenchCounts();
                        updateTableAndStorage();
                    });
                    const deleteButtonCell = document.createElement("td");
                    deleteButtonCell.appendChild(deleteButton);
                    newRow.appendChild(deleteButtonCell);
                }
            });
            document.querySelector(".awesome-form").addEventListener("submit", function (e) {
                e.preventDefault(); // Prevent the default form submission
        
                // Get the values from the form inputs
                const name = nameInput.value;
                const playerClass = classInput.value;
                const spec = specInput.value;
                const benchCount = benchInput.value;
        
                // Validate the inputs
                if (name && playerClass && spec && benchCount !== "") {
                    // Create a new row in rosterData
                    const newRowData = `${name}, ${playerClass}, ${spec}, ${benchCount}`;
                    rosterData.push(newRowData);
        
                    // Update benchCounts and table
                    updateBenchCounts();
                    updateTableAndStorage();
        
                    // Clear the form inputs
                    nameInput.value = "";
                    classInput.value = "";
                    specInput.value = "";
                    benchInput.value = "";
        
                    // Focus on the first input field (name) for the next entry
                    nameInput.focus();
                } 
            });
            tableBody.appendChild(newRow);
        });
    }

    // Initial table setup
    updateTableAndStorage();

    // Initially set the chosenNameMessage content
    chosenNameMessage.textContent = "Chosen: Benched Person Displayed Here";

      // Add click event listener to the "Roll Bench" button
    rollBenchButton.addEventListener("click", function () {
        // Read the number of players to roll from benchCountInput
        const playersToRoll = parseInt(document.getElementById("benchCountInput").value);

        // Check if the input is a valid number
        if (isNaN(playersToRoll) || playersToRoll <= 0) {
            alert("Please enter a valid number of players to roll.");
            return;
        }

        // Calculate the current maximum bench count
        let maxBenchCount = 0;
        for (const name in benchCounts) {
            if (benchCounts.hasOwnProperty(name)) {
                if (benchCounts[name] > maxBenchCount) {
                    maxBenchCount = benchCounts[name];
                }
            }
        }

        // Find eligible people whose bench count is not more than 1 higher than the maximum count
        const eligiblePeople = [];

        // Iterate through the roster and find eligible people
        const rows = tableBody.querySelectorAll("tr");
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const benchCount = parseInt(row.getAttribute("data-bench-count"));
            const name = row.cells[0].textContent;

            if (benchCounts[name] !== undefined && benchCount <= maxBenchCount + maxDifference) {
                eligiblePeople.push({ name, benchCount, spec: row.cells[2].textContent });
            }
        }

        if (eligiblePeople.length >= playersToRoll) {
            // Sort eligible people by bench count in ascending order
            eligiblePeople.sort((a, b) => a.benchCount - b.benchCount);

            // Select the specified number of players
            const selectedPeople = [];

            while (selectedPeople.length < playersToRoll) {
                // Find the next eligible person
                for (let i = 0; i < eligiblePeople.length; i++) {
                    const person = eligiblePeople[i];
                    // Ensure that the person's spec is not already selected
                    if (!selectedPeople.some(selected => selected.spec === person.spec)) {
                        selectedPeople.push(person);
                        break;
                    }
                }
            }

            // Update the selected people
            selectedPeople.forEach(selectedPerson => {
                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i];
                    if (row.cells[0].textContent === selectedPerson.name) {
                        const benchCount = parseInt(row.getAttribute("data-bench-count")) + 1;
                        row.setAttribute("data-bench-count", benchCount);
                        row.cells[3].textContent = benchCount;

                        // Update the rosterData array with the new count
                        const rowIndex = i;
                        const rosterDataArray = rosterData[rowIndex].split(', ');
                        rosterDataArray[3] = benchCount.toString();
                        rosterData[rowIndex] = rosterDataArray.join(', ');

                        // Update benchCounts
                        benchCounts[selectedPerson.name] = benchCount;
                    }
                }
            });

            // Update the table and localStorage
            updateTableAndStorage();

            // Display the names of the chosen people
            const selectedPeopleNames = selectedPeople.map(person => person.name).join(", ");
            chosenNameMessage.textContent = `Chosen: ${selectedPeopleNames}`;
    } else {
        // If there are no eligible people based on the modified Rule 1, choose someone at random
        const randomPersonIndex = Math.floor(Math.random() * rows.length);
        const selectedRow = rows[randomPersonIndex];
        const selectedPersonName = selectedRow.cells[0].textContent;

        // Update the selected person
        const benchCount = parseInt(selectedRow.getAttribute("data-bench-count")) + 1;
        selectedRow.setAttribute("data-bench-count", benchCount);
        selectedRow.cells[3].textContent = benchCount;

        // Update the rosterData array with the new count
        const rowIndex = Array.from(tableBody.children).indexOf(selectedRow);
        const rosterDataArray = rosterData[rowIndex].split(', ');
        rosterDataArray[3] = benchCount.toString();
        rosterData[rowIndex] = rosterDataArray.join(', ');
    }
});

    // Add click event listener to the "Reset Bench" button
    const resetBenchButton = document.getElementById("resetBench");
    resetBenchButton.addEventListener("click", function () {
        // Reset bench counts and update the table
        tableBody.querySelectorAll("tr").forEach(row => {
            row.setAttribute("data-bench-count", 0);
            row.cells[3].textContent = 0;
            const name = row.cells[0].textContent;
            benchCounts[name] = 0;
        });

        // Update the rosterData array with the new counts
        rosterData = rosterData.map(row => {
            const rowData = row.split(', ');
            rowData[3] = "0";
            return rowData.join(', ');
        });

        // Update the table and localStorage
        updateTableAndStorage();

        // Reset the chosenNameMessage
        chosenNameMessage.textContent = "Chosen: Benched Person Displayed Here";
    });
});