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
    - ⛔️ Update "X options available" to "X options available for XYZ" (where XYZ is the filter term). UPDATE: the part "for XYZ" is missing!
- ✅ When pressing `Up`/`Down` keys, the keyboard focus jumps between the filter text field and the checkboxes back and forth.
    - ✅ I'm unsure whether the focus should jump back to the text field when reaching the bottom, or just back to the first option. UPDATE: Thinking about it, we probably keep it like that, as it gives screen reader users an important hint (search wrapped).
- ✅ When a checkbox is checked, following elements are updated accordingly: the "Selected hobbies" fieldset's legend and contained buttons, the "X options selected" button, and the "Available hobbies" fieldset's legend.
- ✅ When `Esc` is pressed while a checkbox is focused, the focus is put to the "X options selected" button, and the dropdown is closed.
    - ⛔️ UPDATE: The dropdown is not yet closed.
- ✅ When the "X options selected" button is pressed, then all checkboxes are unchecked, and the focus is set to the filter text field (and obviously, all other dependent elements are updated accordingly).
    - ✅ Please select all text (so the user can replace a filter term right away)
- ✅ When a button inside "Selected hobbies" is pressed, uncheck the respective checkbox, then:
    - ✅ Focus the next button, if available.
    - ✅ Focus the next button, if available.
    - ✅ Or focus the previous button, if available.
    - ✅ Or focus the text field.
- ✅ When `Page Up`/`Page Down` is pressed (regardless whether inside the text field or when an option is focused), move focus to the very first/last option.
- ✅ When `Enter` is pressed on a checkbox, toggle it (same functionality like `Space`).
    - BUG: While the checkbox indeed is checked, the rest of the widget does not react (ie. the newly selected item is not added to the "Selected hobbies", etc.)
- ✅ When a checkbox is focused and a character key is pressed, then move focus back to the filter input and append the typed character.
    - ✅ There are probably some "special keys" we need to implement, for example `Backspace` - any other that come to your mind?
        - ✅ `Delete` will remove the filter text
- ✅ The first time a filter is entered, add `role="alert"` to `.available-hobbies__counter` (this will make screen readers announce it).
- ✅ Set `hidden` to `fieldset.selected` when there is no option selected.
- ✅ I added `3 selected` to "X options available", please update accordingly.
- ✅ When `Esc` is pressed while the "X options selected" button is focused, then move focus back to the filter input (and select all text).
- ✅ When `Esc` is pressed while filter input is focused, close dropdown (if opened).
- ✅ When clicking into the filter input, open dropdown (if closed).
    - ✅ Simply add/remove its `hidden` attribute to toggle visibility.
- ⚠️ When clicking into the filter input, and the filter already has focus, close dropdown (if opened).
- ✅ When focusing the filter input by keyboard, keep dropdown as is.
    - ✅ When pressing `Up`/`Down` while the dropdown is closed, open it (and keep focus inside filter input).
    - ✅ When pressing `Up`/`Down` while the dropdown is open, move focus to last/first checkbox.
- ✅ Keep `aria-expanded` in sync with the dropdown: set it to `true` when it is open, and to `false` when it is closed.
- ✅ When clicking `.filter__close-options` button, close `fieldset.selected`, set focus to filter text field, and select all text (if there is any).
- ✅ When typing a filter and the dropdown is closed, open it.

### Nice to have / open questions

- I would find it cool to be able to press `Space` to toggle options and `Enter` to close (confirm) an opened dropdown.
    - This might result in confusion for some people, if they think that `Enter` would toggle options, too. We might leverage this by displaying a small hint "Press Space to toggle options" when somebody hits `Enter` while no option is checked yet.
- Another cool thing would be the ability to reset the whole element by pressing `Esc` inside the filter text field: if there is a filter text, it is removed, and when pressing `Esc` another time, the whole element is reset (uncheck all checkboxes).
    - It might be good to show a confirmation "Do you really want to reset the element?" before doing that.

## @josua: some notes to keep in mind

- As `Enter` is intercepted by NVDA and JAWS, we cannot listen to this key on a checkbox (in contrast to radio buttons, checkboxes do not trigger focus mode), which does not allow us to use `Enter` to confirm-and-close => but `Esc` works, so we can use this instead (instead of cancel-and-close) (<a href="https://stackoverflow.com/questions/71040122">more info</a>)
- I'm unsure about `Enter` on `&lt;li&gt;` => is this intercepted, too? While JAWS seems to toggle the checkbox in this situation, NVDA does not seem to...
- The same holds true for `Arrow` keys, but the good thing is that `Up`/`Down` will move the screen reader cursor anyway between the list items (options).
- Live regions are still our "week spot", as expected:
    - Although `aria-live` would be a much better replacement for `role="alert"`, JAWS seems to not support it, at least when just updating its contents! Maybe removing the whole element and then adding it back would trigger JAWS as expected?
    - Putting `role="alert"` seems to have some quirky effects:
        - While Chrome announces an alert immediately when loading the page, FF does not.
            - UPDATE: We fix this by adding the attribute not at document load, but on first its update.
        - While FF announces "alert" plus the actual content of the element, Chrome does only announce its content.
    - _Conclusion: We could try to adapt to different browsers to optimise the user experience for screen readers, e.g. we could use `aria-live` in FF and `role="alert"` in Chrome? If everything else fails, we just use `role="alert"` everywhere (it's not the most beautiful option, but it works)._
- The interplay between `aria-describedby`, putting "everything" into a `<label>`, and having even `role="alert"` mingled into one or the other, seems to have quite a variety of behaviours, depending on the combos of browsers and screen readers.
    - I vote for putting all relevant info (ie. "X options available, X selected") into the `<label>`. Some combos seem to announce changes inside those elements, others do not.
    - I tinkered around with `aria-describedby` instead, but this did not lead to better results. I vote not to use it, as it requires us to throw IDs into the code.
    - Having `role="alert"` inside those elements results in redundant announcements in some combos, as first the content of the alert is announced, and then also the whole `<label>`/`aria-describedby` (incl. the alert).
        - I think in general this is alright, as it just adds more context to the widget's current state.
        - I'm not completely sure whether `aria-live` has the same effect.
    - _Conclusion:_ In the end, we will have to play around a bit with different solutions and see which one works best across all targeted browsers and screen readers. There might be no perfect solution, but in the end: as long as it's working as expected (and in a robust, predictable way), all screen reader users will be more than happy, even if there's a bit of redundancy in the announcements (which they can simply skip by further interacting with the element).
- In Chrome, JAWS jumps to the 2nd option when pressing `Down` inside the filter text field. This is unfortunate. Neither `stopPropagation` nor `preventDefault` seems to change this. In general I'd say: if a screen reader obviously causes some simple standard HTML functionality to produce a bug, then it is their problem, not ours (in contrast to using heavy ARIA stuff, where WE would need to make sure that the functionality works as expected).
- In general, NVDA is much more verbose than JAWS:
    - NVDA announces changes to `<label>` of the currently focused input (this would allow to just put announcements into `<label>`, instead of using `role="alert"`)
    - When moving focus to an element, NVDA announces a lot of info that is related to this element, like a surrounding `<fieldset>` with `<legend>`, an `<ol>` with its number of items, etc.
    - _General question: is this expected behaviour? Why is JAWS so conservative in announcing this useful associated info? Maybe we can ask Quentin about this._
- Having the options' `<label>`s with `display: inline` has the nice effect that NVDA reads the number of the `<li>` and all of its contents (checkbox with label) in one go, but for some reason we cannot activate it anymore with `Space`/`Enter` in NVDA. Only if we use `display: block` it works, but then it splits the announcement into 1) the number of the `<li>`, and 2) its contents.
    - UPDATE: I set `list-style: none` to "defuse" this situation completely. It is enough that screen readers can announce the total number of options, and the "search wrapped" info is given by placing the focus in the text field again.
- Is "uncheck" or "unselect" the right word when talking about checkboxes??
- Our old beloved friend `aria-expanded` does **not** seem to work anymore on plain `<input type="text">` elements (at least in Chrome it does not), see https://a11ysupport.io/tech/aria/aria-expanded_attribute and https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-expanded.
    - When adding `role="combobox"`, it seems to work again. While I try to avoid any `role` (they often used to f*ck up JAWS in earlier days), it seems to be safe here.
        - Should we care about additional ARIA attributes here, like `aria-controls` or `aria-autocomplete`? I think rather not, because in fact we do not offer a "real" ARIA control, but just "misuse" ARIA to announce it as such, while the rest of the interaction is plain HTML and JavaScript.
    - Another option could be to only display "X options available" when expanding the list of options (instead of announcing it when focusing the filter text input), together with `role="alert"`.
- The use of "advanced" CSS still seems to be dangerous: toggling some content inside `::after` when toggling a checkbox breaks the announcement of checked / not checked in Chrome! We better work around this with toggling an additional `<span>` or similar...
- In JAWS + FF, focus mode seems to be on when focusing a checkbox (test by hitting a character => it will be appended to filter)! This is very surprising, as all other combos don't do this!

## Resources

- A typical single and multi selection use case from the ETH can be found here: https://www.bi.id.ethz.ch/pcm-open-services/
- A former proof of concept for a single select autocomplete (it keeps the focus inside the text field when walking through options): https://www.accessibility-developer-guide.com/examples/widgets/autosuggest/_examples/autosuggest-with-radio-buttons/
- A similar proof of concept, namely a date picker, which actually moves the focus into the dropdown when walking through options: https://www.accessibility-developer-guide.com/examples/widgets/datepicker/_examples/datepicker-with-radio-buttons/