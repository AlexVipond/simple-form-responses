let submitApiToken = document.querySelector('#submit-api-token'),
    showTableCheckbox = document.querySelector('#show-table-checkbox'),
    emailPropertyKey = 'email',
    downloadButton = document.querySelector('#download-button'),
    resultsWrapper = document.querySelector('#results-wrapper')
    request = new XMLHttpRequest();

let apiToken, responses, tableHeaders = [], tableData = [], thisResponseObj, tableDataKeys = [], htmlStr, downloadData;

function getApiToken() {
    apiToken = document.querySelector('#api-token').value;
}

function filterBlankEmails(responsesJSON) {
    return responsesJSON.filter(response => response.data[emailPropertyKey] !== '');
}

function getTableHeaders(responsesJSON) {
    // Object.keys(responsesJSON[0].data).forEach(function(key) {
    //     tableHeaders.push(key);
    // });
    tableHeaders = ['first-name', 'last-name', 'email', 'created_at', 'request_ip', 'referrer'];
}

function getTableData(responsesJSON) {
    responsesJSON.forEach(function(response, i, a) {
        thisResponseObj = new Object();
        Object.keys(response.data).forEach(function(key) {
            thisResponseObj[key] = response.data[key];
        });
        thisResponseObj.created_at = response.created_at;
        thisResponseObj.request_ip = response.request_ip;
        thisResponseObj.referrer = response.referrer;
        tableData.push(thisResponseObj);
    });
}

function getTableDataKeys(parsedResponses) {
    parsedResponses.forEach(function(response) {
        tableDataKeys.push(...Object.keys(response));
    });

    tableDataKeys = Array.from(
        new Set(
            tableDataKeys
        )
    );
}

function orderReverseChronologically(thisResponse, nextResponse) {
    let thisResponseTimestamp = new Date(thisResponse.created_at);
    let nextResponseTimestamp = new Date(nextResponse.created_at);
    if(thisResponseTimestamp < nextResponseTimestamp) {
        return 1;
    } else if(thisResponseTimestamp > nextResponseTimestamp) {
        return -1;
    } else {
        return 0;
    }
}

// TODO: Merge duplicate records and show total records on page
function mergeDuplicates(parsedResponses) {
    let uniqueEmails = Array.from(
        new Set(
            parsedResponses.map(response => response[emailPropertyKey])
        )
    );

    function countEmailOccurrences(email) {
        return parsedResponses.filter(response => response.email === email).length;
    }

    uniqueEmails = uniqueEmails.map(function(email) {
        return {
            'email': email,
            'occurrences': countEmailOccurrences(email)
        };
    });

    function isDuplicate(email) {
        return uniqueEmails.find(uniqueEmail => uniqueEmail.email === email).occurrences > 1;
    }

    let duplicates = tableData.filter(response => isDuplicate(response.email))
        .sort(function(a, b) {
            return orderReverseChronologically(a, b);
        });

    tableData = tableData.filter(response => (!isDuplicate(response.email)));

    uniqueEmails = Array.from(
        new Set(
            duplicates.map(duplicate => duplicate.email)
        )
    );

    function getMasterPropertyValue(email, property) {
        let thisValueList = duplicates.filter(response => response.email === email)
            .map(response => response[property]);

        let masterValue = thisValueList.find(function(value) {
            if(value) {
                return true;
            } else {
                return false;
            }
        });

        if(masterValue) {
            return masterValue;
        } else {
            return '';
        }
    }

    let mergedDuplicates = uniqueEmails.map(function(email, index, array) {
        email = {};
        tableDataKeys.forEach(function(key) {
            email[key] = getMasterPropertyValue(array[index], key);
        });
        return email;
    });

    tableData = [...tableData, ...mergedDuplicates].sort(function(a, b) {
        return orderReverseChronologically(a, b);
    });

    console.log(tableData.length);
}

function addHeadersToTable() {
    htmlStr = '';
    htmlStr += '<tr>';
    tableHeaders.forEach(function(header) {
        htmlStr += '<th>' + header + '</th>';
    });
    htmlStr += '</tr>';
    resultsWrapper.innerHTML = htmlStr;
}

function addDataToTable() {
    htmlStr = '';
    tableData.forEach(function(object) {
        htmlStr += '<tr>';
        tableHeaders.forEach(function(header) {
            htmlStr += '<td>' + object[header] + '</td>';
        });
    });
    htmlStr += '</tr>';
    resultsWrapper.innerHTML += htmlStr;
}

function parseData(responsesJSON) {
    getTableHeaders(responsesJSON);
    getTableData(responsesJSON);
    getTableDataKeys(tableData);
}

function cleanData(parsedResponses) {
    function replaceUndefined(response, property) {
        if(response[property] === undefined) {
            response[property] = '';
        }
    }
    
    parsedResponses.forEach(function(response) {
        replaceUndefined(response, 'first-name');
        replaceUndefined(response, 'last-name');
    });
}

function generateTable(parsedResponses) {
    if (showTableCheckbox.checked) {
        addHeadersToTable();
        addDataToTable();
    }
}

function activateDownloadButton(data) {
    downloadButton.innerHTML += '<a class="btn btn-success mb-2" href="data:text/plain;charset=utf-8,' + encodeURIComponent(data) + '" download="responses.csv">Download CSV</a>';
}

function showSearchInput() {
    document.querySelector('#search-input').style.display = "inline-block";
}

request.onload = function() {
    if (this.status >= 200 && this.status < 400) {
        responses = JSON.parse(this.responseText);
        responses = filterBlankEmails(responses);
        parseData(responses);
        cleanData(tableData);
        mergeDuplicates(tableData);
        generateTable(responses);
        downloadData = Papa.unparse(tableData);
        activateDownloadButton(downloadData);
        showSearchInput();
    } else {
        console.log('Failure');
    }
}

request.onerror = function() {
    console.log('Error');
}

submitApiToken.addEventListener('click', function(event) {
    event.preventDefault();
    submitApiToken.disabled = true;
    getApiToken();
    request.open('GET', 'https://getsimpleform.com/messages.json?api_token=' + apiToken);
    request.send();
});
