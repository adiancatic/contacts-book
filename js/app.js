const CONTACTS = 'contacts';
const CONTACT_FILTERS = 'contactFilters';
const contactForm = $('#add-contact-form');
const contactList = $('.app .contact-list');
const searchBox = $('.contact-filter .contact-search input');
const searchClearBtn = $('.contact-filter .contact-search .clear-search');

$(document).ready(() => {
    handleInputPanelToggle();

    if(!localStorage[CONTACTS]) {
        localStorage.setItem(CONTACTS, JSON.stringify([]));
    }
    if(!localStorage[CONTACT_FILTERS]) {
        localStorage.setItem(CONTACT_FILTERS, JSON.stringify({}));
    }

    contactForm.on('submit', (e) => e.preventDefault());

    domAddContactsFromStorage();
    contactSearchBox();
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
    $('.input-panel-wrapper').removeClass('js-active');
    contactForm[0].reset();
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

    console.log(JSON.parse(localStorage.getItem(CONTACTS))); // TODO remove
}

function storeFilters(filter) {
    if(filter === {} || !localStorage.getItem(CONTACT_FILTERS)) {
        return;
    }

    let filters = JSON.parse(localStorage.getItem(CONTACT_FILTERS));

    filters.searchValue = filter.searchValue;

    localStorage.setItem(CONTACT_FILTERS, JSON.stringify(filters));
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

    contactList.append(contact);
}

function domAddContactsFromStorage() {
    if(!localStorage.getItem(CONTACTS) && !localStorage.getItem(CONTACT_FILTERS)) {
        return;
    }
    let contacts = JSON.parse(localStorage.getItem(CONTACTS));
    let filters = JSON.parse(localStorage.getItem(CONTACT_FILTERS));

    /*
     * Check if any filters set and filter contacts accordingly
     */
    if(filters) {
        const searchValue = filters.searchValue.replace(/[[{}()*+?^$|\]\.\\]/g, "\\$&");
        const regex = new RegExp(searchValue, 'i');
        contacts = contacts.filter((o) => {
            return o.firstName.match(regex)
                || o.lastName.match(regex)
                || (o.firstName + ' ' + o.lastName).match(regex);
        });
    }

    for (const key in contacts) {
        domAddContact(contacts[key]);
    }
}

function domUpdateContactList() {
    contactList.empty();
    domAddContactsFromStorage();
}

/*
 * Contact filtering
 */

function contactSearchBox() {
    searchBox.on('input', () => {
        handleContactSearchBox();
    });

    searchClearBtn.on('click', () => {
        searchBox.val('');
        handleContactSearchBox();
    });
}

function handleContactSearchBox() {
    let searchValue = searchBox.val();

    if(searchValue.length > 0 && !searchClearBtn.hasClass('js-active')) {
        searchClearBtn.addClass('js-active');
    } else if(searchValue.length <= 0 && searchClearBtn.hasClass('js-active')) {
        searchClearBtn.removeClass('js-active');
    }

    let oFilter = {
        searchValue: searchValue ?? '',
    };

    storeFilters(oFilter);
    domUpdateContactList();
}