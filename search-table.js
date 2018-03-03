let searchInput, searchTerm, searchableTable, searchableTableRows, i, searchableTableCells, textToSearch;

function searchTable() {
    searchInput = document.querySelector("#search-input");
    searchTerm = searchInput.value.toLowerCase();
    searchableTable = document.querySelector("#search-table");
    searchableTableRows = searchableTable.querySelectorAll("tr");

    for(i = 1; i < searchableTableRows.length; i++) {
        textToSearch = '';
        searchableTableCells = searchableTableRows[i].querySelectorAll("td");
        console.log(searchableTableCells);
        searchableTableCells.forEach(function(cell) {
            textToSearch += cell.textContent.toLowerCase();
        });

        if(textToSearch.indexOf(searchTerm) > -1) {
            searchableTableRows[i].style.display = "table-row";
        } else {
            searchableTableRows[i].style.display = "none";
        }
    }
}
