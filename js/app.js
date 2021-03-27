const NEXT_ID = 'nextId';
const CONTACTS = 'contacts';
const CONTACT_FILTERS = 'contactFilters';

const orderStates = ['default', 'asc', 'desc'];

const inputPanelToggle = $('.input-panel-toggle');
const inputPanel = $('.input-panel-wrapper');
const backdrop = $('.backdrop');

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
    inputPanelToggle.on('click', () => toggleInputPanel());
    $(backdrop, '.js-active').on('click', () => toggleInputPanel());
}

function toggleInputPanel() {
    inputPanel.toggleClass('js-active');
    if(inputPanel.hasClass('js-active')) {
        backdrop.addClass('js-active');
    } else {
        backdrop.removeClass('js-active');
    }
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
 * Contact form validation
 */

function validateContactInputForm() {
    let validation;
    let passedAll = true;

    domRemoveValidationErrors();

    const firstName = $('#add-contact-form #first-name');
    validation = validateName(firstName.val());
    if(typeof validation != 'boolean') {
        passedAll = false;
        domAddFormError(firstName, validation);
    }

    const lastName = $('#add-contact-form #last-name');
    validation = validateName(lastName.val());
    if(typeof validation != 'boolean') {
        passedAll = false;
        domAddFormError(lastName, validation);
    }

    const phoneNumber = $('#add-contact-form #phone-number');
    validation = validatePhoneNumber(phoneNumber.val());
    if(typeof validation != 'boolean') {
        passedAll = false;
        domAddFormError(phoneNumber, validation);
    }

    const email = $('#add-contact-form #e-mail');
    validation = validateEmail(email.val());
    if(typeof validation != 'boolean') {
        passedAll = false;
        domAddFormError(email, validation);
    }

    return passedAll;
}

function domAddFormError(formField, errorMsg) {
    const parent = formField.parent();
    parent.addClass('form-error');

    const error = document.createElement('span');
    error.className = 'error';
    error.innerText = errorMsg;

    $(error).appendTo(parent);
}

function validateName(name) {
    let regex;

    // Check if not empty or only whitespace
    regex = new RegExp(/^\s*$/, 'i');
    if(name.match(regex)) return 'Field can not be empty.';

    // Check if only letters
    regex = new RegExp(/^[a-zA-z]+\s*$/, 'i');
    if(!name.match(regex)) return 'Only letters and spaces allowed.';

    // Check if at least 1 character
    regex = new RegExp(/^.+$/, 'i');
    if(!regex) return 'At least one character.';

    return true;
}

function validatePhoneNumber(number) {
    let regex;

    // Check if not empty or only whitespace
    regex = new RegExp(/^\s*$/, 'i');
    if(number.match(regex)) return 'Field can not be empty.';

    // Check if only numbers ('+' allowed as first character)
    regex = new RegExp(/^\+?[0-9]+\s*$/, 'i');
    if(!number.match(regex)) return 'Only numbers allowed.';

    return true;
}

function validateEmail(email) {
    let regex;

    regex = new RegExp(/^([]?|[a-zA-Z0-9._]+@[a-zA-Z0-9]+\.[a-zA-Z]+)$/, 'i');
    if(!email.match(regex)) return 'Email format is wrong.';

    return true;
}

function domRemoveValidationErrors() {
    const form = $('#add-contact-form');
    form.find('span.error').remove();
    form.find('.field').removeClass('form-error');
}

/*
 * Contact storage handling
 */

function addContact() {
    const isValidForm = validateContactInputForm();
    if(!isValidForm) {
        return;
    }

    const contact = getNewContact();
    storeContact(contact);
    domAddContact(contact);
    toggleInputPanel();
    contactForm[0].reset();
}

function removeContact(contactId) {
    if(!contactId) {
        return;
    }
    contactId = parseInt(contactId);

    let contacts = JSON.parse(localStorage.getItem(CONTACTS));
    if(!contacts) {
        return;
    }

    const newContacts = contacts.filter((c) => c.id !== contactId);
    localStorage.setItem(CONTACTS, JSON.stringify(newContacts));
}

function getNewContact() {
    let contact = {};
    let formData = contactForm.serializeArray();
    for (const key in formData) {
        const data = formData[key];
        contact[data.name] = data.value ?? '';
    }
    contact['avatar'] = 'https://picsum.photos/id/' + Math.floor(Math.random() * 100) + '/256';
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
    const id = parseInt(JSON.parse(localStorage.getItem(NEXT_ID)));
    const newId = id + 1;
    localStorage.setItem(NEXT_ID, JSON.stringify(newId));
    return id;
}

function getContactById(contactId) {
    let contacts = JSON.parse(localStorage.getItem(CONTACTS));
    if(!contacts) {
        return;
    }
    for (const key in contacts) {
        if(contacts[key].id === parseInt(contactId)) {
            return contacts[key];
        }
    }
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
    let template = $('.template-contact-item').clone();
    let contact = $($(template.prop('content')).prop('firstElementChild'));

    contact.attr('data-id', oContact.id);

    contact.find('.avatar img')
        .attr('src', oContact.avatar)
        .attr('alt', oContact.firstName + ' ' + oContact.lastName);

    contact.find('.contact-info')
        .text(oContact.firstName + ' ' + oContact.lastName);

    contact.appendTo(contactList);
}

function domRemoveContact(contactHtml) {
    const contactId = $(contactHtml).closest('.contact-view').attr('data-id');
    if(!contactId) {
        return;
    }

    const oContact = getContactById(contactId);
    if(!oContact) {
        return;
    }

    const removalConfirmed = confirm('Are you sure you want to delete '
        + oContact.firstName + ' ' + oContact.lastName
        + ' from your contact list?');

    if(!removalConfirmed) {
        return;
    }

    removeContact(contactId);
    domUpdateContactList();
    domClearContactView();
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
            contacts = contacts.sort((a, b) => {
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

function domShowContactDetailed(contact) {
    const contactId = $(contact.closest('.contact-item')).attr('data-id');
    const oContact = getContactById(contactId);
    if(!oContact) {
        return;
    }
    $('main').empty();
    domRenderContactDetailed(oContact);
}

function domRenderContactDetailed(oContact) {
    let template = $('.template-contact-view').clone();
    let contact = $($(template.prop('content')).prop('firstElementChild'));

    contact.attr('data-id', oContact.id);

    contact.find('.avatar img')
        .attr('src', oContact.avatar)
        .attr('alt', oContact.firstName + ' ' + oContact.lastName);

    contact.find('.full-name .first-name')
        .text(oContact.firstName);

    contact.find('.full-name .last-name')
        .text(oContact.lastName);

    // contact.find('.most-recent-activity .activity')
    //     .text();

    contact.find('.contacts .phone-number')
        .text(oContact.phoneNumber);

    contact.find('.contacts .e-mail')
        .text(oContact.email);

    contact.appendTo('main');
}

function domClearContactView() {
    $('.contact-view').remove();
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