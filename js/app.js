const CONTACTS = 'contacts';
const contactForm = $('#add-contact-form');


$(document).ready(() => {
    handleInputPanelToggle();

    if(!localStorage[CONTACTS]) {
        localStorage.setItem(CONTACTS, JSON.stringify([]));
    }

    contactForm.on('submit', function (e) {
        e.preventDefault();
    });


});





function handleInputPanelToggle() {
    const toggle = $('.input-panel-toggle');
    const inputPanel = $('.input-panel-wrapper');
    const backdrop = $('.backdrop');

    toggle.on('click', () => {
        backdrop.fadeToggle();
        inputPanel.toggleClass('js-active');
    })
}

function addContact() {
    const contact = getNewContact();
    storeContact(contact);
}

function getNewContact() {
    let contact = {};
    let formData = contactForm.serializeArray();
    for (const key in formData) {
        const data = formData[key];
        contact[data.name] = data.value;
    }
    return contact;
}

function storeContact(contact) {
    if(contact === {} || !localStorage.getItem(CONTACTS)) {
        return;
    }
    let contacts = JSON.parse(localStorage.getItem(CONTACTS));
    contacts.push(contact);
    localStorage.setItem(CONTACTS, JSON.stringify(contacts));
    console.log(JSON.parse(localStorage.getItem(CONTACTS)))
}