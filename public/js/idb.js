// hold db connection with a variable
let db;

// create connection (v. 1)
const request = indexedDB.open('budget_tracker', 1);

// if version changes, trigger event
request.onupgradeneeded = function (event) {

    // save referece to db
    const db = event.target.result;

    // create object store and make it auto increment
    db.createObjectStore('new_request', { autoIncrement: true });

};

// when successful connection to db
request.onsuccess = function(event) {

    // when db is created with object store, save reference to variable
    db = event.target.result;

    // check if app has internet connection
    if (navigator.onLine) {
        uploadRequest();
    }
};

// if there is an error
request.onerror = function (event) {

    // log the error in console
    console.log(event.target.errorCode);
}

// if attempting to send request without internet connection
function saveRecord(record) {

    // open a new transaction with the database with read and write permissions
    const transaction = db.transaction(['new_request'], 'readWrite');

    // access the object store
    const objectStoreOfRequest = transaction.objectStore('new_request');

    // add to object store
    objectStoreOfRequest.add(record);
};

function uploadRequest() {

    // open transaction
    const transaction = db.transaction(['new_request'], 'readwrite');

    // access your object store
    const objectStoreOfRequest = transaction.objectStore('new_request');

    // get all records from object store and put in variable
    const getAll = objectStoreOfRequest.getAll();

    // if .getAll was successful
    getAll.onsuccess = function() {

        // if object store had data, send to api server
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message) {
                    throw new Error(serverResponse);
                }

                // open new transaction
                const transaction = db.transaction(['new_request'], 'readwrite');

                // access object store
                const objectStoreOfRequest = transaction.objectStore('new_request');

                // clear everything in object store
                objectStoreOfRequest.clear();

                alert('Your transactions been completed!');
            })
            .catch(err => {
                console.log(err);
            })
        }
    }
}

// check for internet connectivity to re-establish connection
window.addEventListener('online', uploadRequest);