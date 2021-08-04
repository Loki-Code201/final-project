/////////////// Utility functions ////////////////////

function PantryItem(name, quantity, expiration, category) {
  this.name = name;
  this.quantity = quantity;
  this.expiration = expiration;
  this.category = category;
}

// attributes is an object  = {src: "", alt: ""}
function makeElement(tagName, parent, textContent, attributes) {
  const element = document.createElement(tagName);
  if (attributes) {
    for (const property in attributes) {
      element.setAttribute(property, attributes[property]);
    }
  }
  if (textContent) {
    element.textContent = textContent;
  }
  parent.appendChild(element);
  return element; // returns the created element
}

////////////// local storage functions //////////////////

function getLocalStorage(name) {
  const storageData = localStorage.getItem(name);
  if (storageData) {
    const parsedArray = JSON.parse(storageData);

    return parsedArray;
  }
}

function setLocalStorage(name, array) {
  const stringifiedArray = JSON.stringify(array);
  localStorage.setItem(name, stringifiedArray);
}

////////////////// rendering functions
//
function renderTableButton(value, className, fn) {
  let btn = document.createElement("input");
  btn.type = "button";

  btn.className = className;
  btn.value = value;
  btn.onclick = fn;
  return btn;
}

function deleteItemFromTable(event) {
  const th = event.target.parentNode;
  const tr = th.parentNode;
  tr.parentNode.removeChild(tr);
  // re render the table?
  // this function rerenders it automatically it seems, so don't need to RE render
}
function deleteItemFromStorage(event) {
  const currentItemToDelete = event.target.parentNode.parentNode;
  const currentItemTDs = currentItemToDelete.children;

  // convert the HTMLCollection to an array
  const newArray = [...currentItemTDs];
  // remove the first item out of the array (this is the button in the table which we don't need right here)
  newArray.shift();

  const itemValues = [];
  for (let td of newArray) {
    itemValues.push(td.innerHTML);
  }
  console.log(itemValues);

  const currentLocalStorage = getLocalStorage("pantry");
  console.log(currentLocalStorage);

  const filtered = currentLocalStorage.filter(function (el) {
    return el.name != itemValues[0];
  });

  console.log(filtered);
  console.log(currentLocalStorage);
  return filtered; // returns the new array to put in Local Storage
}

function deleteItem(event) {
  deleteItemFromTable(event);
  setLocalStorage("pantry", deleteItemFromStorage(event));

  // delete obj
  // delete item from local storage
  // separate functions?
}

// table stuff
// values parameter is an array
function renderTableRow(values) {
  const tbodyElem = document.getElementById("tbody");
  tbodyElem.innerHTML = "";

  for (const array of values) {
    const trElem = makeElement("tr", tbodyElem);
    const thElem = makeElement("th", trElem);
    thElem.appendChild(renderTableButton("Delete", "button", deleteItem));

    for (const value of array) {
      makeElement("td", trElem, value);
    }
  }
}

function renderFromStorage(storageData) {
  const rehydratedValues = [];
  for (const obj of storageData) {
    rehydratedValues.push(Object.values(obj));
  }
  renderTableRow(rehydratedValues); // TODO: change to the values from rehydratedObj
}

//////////////// Listeners ////////////////////////
function formCb(event) {
  event.preventDefault();
  // need to append to table elem
  const formData = new FormData(event.target);
  const values = [];
  const currentLocalStorage = getLocalStorage("pantry");

  // iterates through the key and value of the form inputs
  for (const pair of formData.entries()) {
    values.push(pair[1]);
  }

  // gets what is in the current local storage array of objects (if any), and add an object into that array and then put that array back into local storage
  if (currentLocalStorage) {
    // check for duplicate item names
    const checkDuplicate = currentLocalStorage.some((elem) => {
      return elem.name.toLowerCase() === values[0].toLowerCase();
    });
    if (checkDuplicate) {
      // remove from local storage to update the quantity then add back
      values[1];
      alert("Already Added");
      // offer to add the quanitity
      return;
    }

    currentLocalStorage.push(new PantryItem(...values));
    setLocalStorage("pantry", currentLocalStorage);
  } else {
    // no local storage yet so set it up
    this.push(new PantryItem(...values)); // `this` refers to the bound `pantryObjArray` array

    setLocalStorage("pantry", this);
  }

  renderFromStorage(getLocalStorage("pantry")); //currently not clearing clearing the current table
}

///////////////// Main ///////////////////
function main() {
  const form = document.getElementById("addFood");
  const storageData = getLocalStorage("pantry");
  if (storageData) {
    renderFromStorage(storageData);
  }

  const pantryObjArray = []; // being put in local storage
  form.addEventListener("submit", formCb.bind(pantryObjArray));

  // DEVELOPMENT purposes only
  const resetButton = document.getElementById("resetHistory");
  resetButton.onclick = function () {
    window.localStorage.clear();
    window.location.reload();
  };
}
main();
