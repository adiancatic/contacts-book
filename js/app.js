const CONTACTS = 'contacts';
const contactForm = $('#add-contact-form');

$(document).ready(() => {
    handleInputPanelToggle();

    if(!localStorage[CONTACTS]) {
        localStorage.setItem(CONTACTS, JSON.stringify([]));
    }

    contactForm.on('submit', (e) => e.preventDefault());

    domAddContactsFromStorage();
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

/*
 * Contact storage handling
 */

function addContact() {
    const contact = getNewContact();
    storeContact(contact);
    domAddContact(contact);
}

function getNewContact() {
    let contact = {};
    let formData = contactForm.serializeArray();
    for (const key in formData) {
        const data = formData[key];
        contact[data.name] = data.value ?? '';
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

/*
 * Contact rendering
 */

function domAddContact(oContact) {
    /*
     * Avatar
     */
    let avatar = document.createElement('div');
    avatar.className = 'avatar';

    let img = document.createElement('img');
    img.src = 'https://www.unsplash.it/100';
    img.alt = '';

    avatar.append(img);

    /*
     * Contact info
     */
    let contactInfo = document.createElement('div');
    contactInfo.className = 'contact-info';
    contactInfo.innerText = oContact.firstName + ' ' + oContact.lastName;

    /*
     * Controls
     */
    let controls = document.createElement('div');
    controls.className = 'controls';

    // Button Call
    let buttonCall = document.createElement('a');
    buttonCall.className = 'btn-call';
    buttonCall.href = 'tel:' + oContact.phoneNumber.replace(' ', '');
    if(!oContact.phoneNumber) buttonCall.classList.add('no-phone-number');

    let iconCall = document.createElement('i');
    iconCall.className = 'fas fa-phone';

    buttonCall.append(iconCall);
    controls.append(buttonCall);

    // Button More
    let buttonMore = document.createElement('button');
    buttonMore.type = 'button';
    buttonMore.className = 'btn-more';

    let iconMore = document.createElement('i');
    iconMore.className = 'fas fa-angle-right';

    buttonMore.append(iconMore);
    controls.append(buttonMore);

    /*
     * Append child elements to parent
     */
    let contact = document.createElement('div');
    contact.className = 'contact-item';

    contact.append(avatar);
    contact.append(contactInfo);
    contact.append(controls);

    $('.app aside').append(contact);
}

function domAddContactsFromStorage() {
    if(!localStorage.getItem(CONTACTS)) {
        return;
    }
    let contacts = JSON.parse(localStorage.getItem(CONTACTS));
    for (const key in contacts) {
        domAddContact(contacts[key]);
    }
}