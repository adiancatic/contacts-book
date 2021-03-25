const NEXT_ID = 'nextId';
const CONTACTS = 'contacts';
const CONTACT_FILTERS = 'contactFilters';

const orderStates = ['default', 'asc', 'desc'];

const contactForm = $('#add-contact-form');
const contactList = $('.app .contact-list');
const searchBox = $('.contact-filter .contact-search input');
const searchClearBtn = $('.contact-filter .contact-search .clear-search');
const sortField = $('.contact-filter .contact-sort select');
const orderBtn = $('.contact-filter .contact-sort .js-order');


$(document).ready(() => {
    handleInputPanelToggle();

    contactForm.on('submit', (e) => e.preventDefault());

    localStorageInit();

    domAddContactsFromStorage();
    contactSearchInit();
    contactSearchBox();

    contactSortInit();
    contactSort();

    contactOrderInit();
    contactOrder();
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

function localStorageInit() {
    if(!localStorage[NEXT_ID]) {
        localStorage.setItem(NEXT_ID, JSON.stringify(0));
    }
    if(!localStorage[CONTACTS]) {
        localStorage.setItem(CONTACTS, JSON.stringify([]));
    }
    if(!localStorage[CONTACT_FILTERS]) {
        localStorage.setItem(CONTACT_FILTERS, JSON.stringify({}));
    }
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
    contact.id = nextId();
    contacts.push(contact);
    localStorage.setItem(CONTACTS, JSON.stringify(contacts));

    console.log(JSON.parse(localStorage.getItem(CONTACTS))); // TODO remove
}

function nextId() {
    let id = JSON.parse(localStorage.getItem(NEXT_ID));
    localStorage.setItem(NEXT_ID, JSON.stringify(id++));
    return id;
}

function storeFilters(filter) {
    localStorage.setItem(CONTACT_FILTERS, JSON.stringify(filter));
}

function filterGetSearch() {
    let filters = JSON.parse(localStorage.getItem(CONTACT_FILTERS));
    return filters.searchValue ?? '';
}

function filterGetSort() {
    let filters = JSON.parse(localStorage.getItem(CONTACT_FILTERS));
    return filters.sortValue ?? '';
}

function filterGetOrder() {
    let filters = JSON.parse(localStorage.getItem(CONTACT_FILTERS));
    return filters.orderValue ?? '';
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

        if(filters.searchValue) {
            const searchValue = filters.searchValue.replace(/[[{}()*+?^$|\]\.\\]/g, "\\$&");
            const regex = new RegExp(searchValue, 'i');
            contacts = contacts.filter((o) => {
                return o.firstName.match(regex)
                    || o.lastName.match(regex)
                    || (o.firstName + ' ' + o.lastName).match(regex);
            });
        }

        if(filters.sortValue) {
            contacts = contacts.sort(function(a, b) {
                if(filters.sortValue === 'firstName') {
                    if(a.firstName < b.firstName) return -1;
                    if(a.firstName > b.firstName) return 1;
                    return 0;
                }
                if(filters.sortValue === 'lastName') {
                    if(a.lastName < b.lastName) return -1;
                    if(a.lastName > b.lastName) return 1;
                    return 0;
                }
                return 0;
            });
        }

        if(filters.orderValue) {
            const comparator = (a, b) => {
                if(filters.orderValue === 'asc') {
                    return a > b;
                } else if(filters.orderValue === 'desc') {
                    return a < b;
                }
                return 0;
            };
            if(filters.sortValue === 'firstName') {
                contacts = contacts.sort((a, b) => comparator(a.firstName, b.firstName));
            } else if(filters.sortValue === 'lastName') {
                contacts = contacts.sort((a, b) => comparator(a.lastName, b.lastName));
            } else {
                contacts = contacts.sort((a, b) => comparator(a.id, b.id));
            }
        }

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

function contactSearchInit() {
    const searchValue = filterGetSearch();
    if(!searchValue) {
        return;
    }
    searchBox.val(searchValue);
}

function contactSearchBox() {
    handleContactSearchClearBtn();
    searchBox.on('input', () => {
        handleContactSearchBox();
    });
    searchClearBtn.on('click', () => {
        searchBox.val('');
        handleContactSearchBox();
    });
}

function handleContactSearchBox() {
    handleContactSearchClearBtn();
    let oFilter = {
        searchValue: searchBox.val() ?? '',
        sortValue: filterGetSort(),
        orderValue: filterGetOrder(),
    };
    storeFilters(oFilter);
    domUpdateContactList();
}

function handleContactSearchClearBtn() {
    if(searchBox.val().length > 0 && !searchClearBtn.hasClass('js-active')) {
        searchClearBtn.addClass('js-active');
    } else if(searchBox.val().length <= 0 && searchClearBtn.hasClass('js-active')) {
        searchClearBtn.removeClass('js-active');
    }
}

// Sort

function contactSortInit() {
    const selectedSortOption = filterGetSort();
    if(!selectedSortOption) {
        return;
    }

    const options = sortField.children();
    options.each(function () {
        if($(this).val() === selectedSortOption) {
            $(this).prop('selected', true);
        }
    })
}

function contactSort() {
    sortField.on('change', () => {
        let oFilter = {
            searchValue: filterGetSearch(),
            sortValue: sortField.val() ?? '',
            orderValue: filterGetOrder(),
        };
        storeFilters(oFilter);
        domUpdateContactList();
    });
}

// Order

function contactOrder() {
    orderBtn.on('click', () => {
        const currentState = orderBtn.attr('data-state');
        const currentStateIndex = orderStates.findIndex((e) => e === currentState);
        const nextStateIndex = (currentStateIndex === orderStates.length - 1) ? 0 : currentStateIndex + 1;

        let oFilter = {
            searchValue: filterGetSearch(),
            sortValue: filterGetSort(),
            orderValue: orderStates[nextStateIndex] ?? '',
        };

        storeFilters(oFilter);
        domUpdateContactList();
        orderBtn.attr('data-state', orderStates[nextStateIndex]);
    });
}

function contactOrderInit() {
    const selectedOrderOption = filterGetOrder();
    if(!selectedOrderOption) {
        return;
    }
    orderBtn.attr('data-state', selectedOrderOption);
}