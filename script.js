var fE, bE, contactsArray = [], ContactApp = {
  formElements: {
    firstNameInput: document.getElementById('first-name-input'),
    lastNameInput: document.getElementById('last-name-input'),
    phoneInput: document.getElementById('phone-input')
  },
  buttonElements: {
    addButton: document.getElementById('add-btn'),
    importButton: document.getElementById('import-btn'),
    exportButton: document.getElementById('export-btn')
  },
  otherElements: {
    eventLog: document.getElementById('event-log'),
    contactList: document.getElementById('contact-list'),
    exportImport: document.getElementById('json-input')
  },
  contact: function(first,last,phone) {
    this.firstName = first;
    this.lastName = last;
    this.phone = phone;
  },
  initialize: function () {
    fE = this.formElements;
    bE = this.buttonElements;
    oE = this.otherElements;
    this.setupForm();
    this.setupButtons();
    // checks local storage
    var storage = localStorage.getItem("contacts")
    if (storage !== null) {
      this.loadContacts(storage);
      this.logEvent('Loaded data from local storage');
    }
  },
  setupButtons: function() {
    for (key in bE) {
      bE[key].addEventListener('click', this[key].bind(this));
    }
  },
  setupForm: function() {
    var that = this;
    fE.firstNameInput.addEventListener('keyup', function() {
      that.validate.isNotEmpty(this,0);
    })
    fE.lastNameInput.addEventListener('keyup', function() {
      that.validate.isNotEmpty(this,1);
    })
    fE.phoneInput.addEventListener('keyup', function() {
      if (that.validate.isNotEmpty(this,2))
        that.validate.isNumber(this,2);
    })
  },
  clearForm: function() {
    for (key in fE) {
      fE[key].value = '';
    }
  },
  resetContacts: function() {
    while (oE.contactList.firstChild) {
      oE.contactList.removeChild(oE.contactList.firstChild);
    }
  },
  loadContacts: function(data) {
    try {
        contactsArray = JSON.parse(data)
    } catch (e) {
        alert('Cannot load data JSON errors');
        this.logEvent('Failed to parse JSON');
        return false;
    } 
    for (var i=0;i<contactsArray.length;i++)
      this.renderContact(contactsArray[i], i);
    this.logEvent('User imported contacts');
  },
  logEvent: function(message) {
    var el = document.createElement('div');
    el.innerText = message;
    oE.eventLog.appendChild(el);
  },
  addButton: function (event) {
    //validates all inputs
    var counter = 0;
    for (key in fE) {
      var valid = this.validate.isNotEmpty(fE[key],counter);
      counter++;
    }
    // if validation passes
    if (valid) {
      var newObj = new this.contact(fE.firstNameInput.value,fE.lastNameInput.value,fE.phoneInput.value);
      // add to contact array
      contactsArray.push(newObj);
      this.renderContact(newObj, contactsArray.length-1);
      this.clearForm();
      this.logEvent('User added contact successfully');
    }
    else {
      this.logEvent('User added invalid contact');
    }
  },
  renderContact: function(contact, index) {
    var that = this;
    var el = document.createElement('li');
    el.innerHTML = '<div data-index="' + index + '">' +
        '<button class="remove">Remove</button>' +
        contact.lastName + ', ' +
        contact.firstName + ' - ' +
        contact.phone +
        '</div>';
    el.querySelectorAll('button')[0].addEventListener('click', function(event) {
      that.removeContact(event.currentTarget);
    })
    oE.contactList.appendChild(el);
  },
  removeContact: function(el) {
    var removeIndex = parseInt(el.parentNode.getAttribute('data-index'));
    contactsArray.splice(removeIndex,1);
    var parent = el.parentNode;
    parent.parentNode.removeChild(parent);
    this.logEvent('User removed contact successfully');
  },
  importButton: function() {
    this.resetContacts();
    this.loadContacts(oE.exportImport.value);
  },
  exportButton: function() {
    this.logEvent('User exported contacts');
    oE.exportImport.value = JSON.stringify(contactsArray);
  },
  storeData: function() {
    localStorage.setItem('contacts', JSON.stringify(contactsArray));
  },
  validate: {
     // validates for more than one character
     isNotEmpty : function(elem,counter) {
      var str = elem.value;
      var re = /.+/;
      if(!str.match(re)) {
        document.getElementsByClassName('error-message')[counter].innerHTML = 'Field cannot be blank.';
        return false;
      } else {
        document.getElementsByClassName('error-message')[counter].innerHTML = '';
        return true;
      }
     },
     //validates for numbers only (phone number)
     isNumber : function(elem, counter) {
      var str = elem.value;
      var re = /^\d+$/;
      str = str.toString();
      if (!str.match(re)) {
        document.getElementsByClassName('error-message')[counter].innerHTML = 'Field must contain only numbers.';
        return false;
      }
      document.getElementsByClassName('error-message')[counter].innerHTML = '';
      return true;
     }
  }
}


document.addEventListener('DOMContentLoaded', function(){
  ContactApp.initialize();

  window.onbeforeunload = function (e) {
    ContactApp.storeData();
  };
});
