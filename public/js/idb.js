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
        // sendRequest();
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

