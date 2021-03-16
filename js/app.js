$(document).ready(() => {
    handleInputPanelToggle();
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