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
    - Screen readers: JAWS+Chrome, NVDA+Chrome, NVDA+FF
- In a later version, it also needs mobile support

## @xaver: basic interactive functionality

- ✅ When entering a filter term into the text field, the checkboxes should be filtered (set HTML `hidden` attribute).
    - ✅ Update "X options available" accordingly.
- ✅ When pressing `Up`/`Down` keys, the keyboard focus jumps between the filter text field and the checkboxes back and forth.
    - ❓ I'm unsure whether the focus should jump back to the text field when reaching the bottom, or just back to the first option.
- ✅ When a checkbox is checked, following elements are updated accordingly: the "Selected hobbies" fieldset's legend and contained buttons, the "X options selected" button, and the "Available hobbies" fieldset's legend.
- ✅ When `Esc` is pressed while a checkbox is focused, the focus is put to the "X options selected" button.
- ✅ When the "X options selected" button is pressed, then all checkboxes are unchecked, and the focus is set to the filter text field (and obviously, all other dependent elements are updated accordingly).
- When a button inside "Selected hobbies" is pressed, uncheck the respective checkbox, then:
    - Focus the next button, if available.
    - Or focus the previous button, if available.
    - Or focus the text field.
- When `Page Up`/`Page Down` is pressed (regardless whether inside the text field or when an option is focused), move focus to the very first/last option.
- When `Enter` is pressed on a checkbox, toggle it (same functionality like `Space`).

## @josua: some notes to keep in mind

- As `Enter` is intercepted by NVDA and JAWS, we cannot listen to this key on a checkbox (in contrast to radio buttons, checkboxes do not trigger focus mode), which does not allow us to use `Enter` to confirm-and-close => but `Esc` works, so we can use this instead (instead of cancel-and-close) (<a href="https://stackoverflow.com/questions/71040122">more info</a>)
- I'm unsure about `Enter` on `&lt;li&gt;` => is this intercepted, too? While JAWS seems to toggle the checkbox in this situation, NVDA does not seem to...
- The same holds true for `Arrow` keys, but the good thing is that `Up`/`Down` will move the screen reader cursor anyway between the list items (options).
- Live regions are still our "week spot", as expected:
    - Although `aria-live` would be a much better replacement for `role="alert"`, JAWS seems to not support it, at least when just updating its contents! Maybe removing the whole element and then adding it back would trigger JAWS as expected?
    - Putting `role="alert"` seems to have some quirky effects:
        - While Chrome announces an alert immediately when loading the page, FF does not.
        - While FF announces "alert" plus the actual content of the element, Chrome does only announce its content.
    - _Conclusion: We could try to adapt to different browsers to optimise the user experience for screen readers, e.g. we could use `aria-live` in FF and `role="alert"` in Chrome? If everything else fails, we just use `role="alert"` everywhere (it's not the most beautiful option, but it works)._
- In Chrome, JAWS jumps to the 2nd option when pressing `Down` inside the filter text field. This is unfortunate. Neither `stopPropagation` nor `preventDefault` seems to change this. In general I'd say: if a screen reader obviously causes some simple standard HTML functionality to produce a bug, then it is their problem, not ours (in contrast to using heavy ARIA stuff, where WE would need to make sure that the functionality works as expected).
- In general, NVDA is much more verbose than JAWS:
    - NVDA announces changes to `<label>` of the currently focused input (this would allow to just put announcements into `<label>`, instead of using `role="alert"`)
    - When moving focus to an element, NVDA announces a lot of info that is related to this element, like a surrounding `<fieldset>` with `<legend>`, an `<ol>` with its number of items, etc.
    - _General question: is this expected behaviour? Why is JAWS so conservative in announcing this useful associated info? Maybe we can ask Quentin about this._

## Resources

- A typical single and multi selection use case from the ETH can be found here: https://www.bi.id.ethz.ch/pcm-open-services/
- A former proof of concept for a single select autocomplete (it keeps the focus inside the text field when walking through options): https://www.accessibility-developer-guide.com/examples/widgets/autosuggest/_examples/autosuggest-with-radio-buttons/
- A similar proof of concept, namely a date picker, which actually moves the focus into the dropdown when walking through options: https://www.accessibility-developer-guide.com/examples/widgets/datepicker/_examples/datepicker-with-radio-buttons/