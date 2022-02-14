# Accessible Filterable Single/Multi-Selection Dropdown Widget

A **proof of concept** to show that complex custom widgets can be implemented in both a visually appealing and accessible way using standard HTML form controls.

It is a collaboration between [ETH Zürich](https://ethz.ch) and [Nothing](https://www.nothing.ch).

## Requirements

- Needs to feel and look like traditional solutions (similar to [Select2](https://select2.org/getting-started/basic-usage)), but instead of using ARIA excessively, we want to rely on basic HTML form controls and intelligent focus management.
- Needs to work for both single and multi selection.
    - For single selection, we will use radio buttons.
    - For multi selection, we will use radio buttons.
- In a first version, it needs to support desktop computers:
    - Mouse usage (obviously)
    - Keyboard-only usage (`Up`, `Down`, `Enter`, `Space`, `Esc`)
    - Screen readers: JAWS+Chrome, NVDA+Chrome, NVDA+Firefox
- In a later version, it also needs mobile support

## @xaver: basic interactive functionality

- When entering a filter term into the text field, the checkboxes should be filtered (set HTML `hidden` attribute).
    - Update "X options available" accordingly.
- When pressing `Up`/`Down` keys, the keyboard focus jumps between the filter text field and the checkboxes back and forth.
- When a checkbox is checked, following elements are updated accordingly: the "Selected hobbies" fieldset's legend and contained buttons, the "X options selected" button, and the "Available hobbies" fieldset's legend.
- When `Esc` is pressed while a checkbox is focused, the focus is put to the "X options selected" button.
- When the "X options selected" button is pressed, then all checkboxes are unchecked, and the focus is set to the filter text field (and obviously, all other dependent elements are updated accordingly).

## @josua: some notes to keep in mind

- As `Enter` is intercepted by NVDA and JAWS, we cannot listen to this key on a checkbox (in contrast to radio buttons, checkboxes do not trigger focus mode), which does not allow us to use `Enter` to confirm-and-close => but `Esc` works, so we can use this instead (instead of cancel-and-close) (<a href="https://stackoverflow.com/questions/71040122">more info</a>)
- I'm unsure about `Enter` on `&lt;li&gt;` => is this intercepted, too? While JAWS seems to toggle the checkbox in this situation, NVDA does not seem to...
- The same holds true for `Arrow` keys, but the good thing is that `Up`/`Down` will move the screen reader cursor anyway between the list items (options).
- Putting `role="alert"` seems to have some quirky effects: in Chrome, it is announced immediately, but not anymore when focusing the input.

## Resources

- A typical single and multi selection use case from the ETH can be found here: https://www.bi.id.ethz.ch/pcm-open-services/
- A former proof of concept for a single select autocomplete (it keeps the focus inside the text field when walking through options): https://www.accessibility-developer-guide.com/examples/widgets/autosuggest/_examples/autosuggest-with-radio-buttons/
- A similar proof of concept, namely a date picker, which actually moves the focus into the dropdown when walking through options: https://www.accessibility-developer-guide.com/examples/widgets/datepicker/_examples/datepicker-with-radio-buttons/