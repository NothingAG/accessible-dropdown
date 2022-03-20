"use strict";

const elems = {};

elems.widgetContainer = document.querySelector(".widget--container");
elems.filterAndOptionsContainer = document.querySelector(".widget--filter-and-options-container");
elems.filterContainer = document.querySelector(".widget--filter-container");
elems.filterInput = document.querySelector(".widget--filter-input");
elems.unselectAllButton = document.querySelector(".widget--unselect-all-button");
elems.unselectAllButtonText = document.querySelector(".widget--unselect-all-button-text");
elems.toggleOptionsButton = document.querySelector(".widget--toggle-options-button");
elems.toggleOptionsButtonIcon = document.querySelector(".widget--toggle-options-button-icon");
elems.availableOptionsContainer = document.querySelector(".widget--available-options-container");
elems.xOfYForFilterText = document.querySelector(".widget--x-of-y-for-filter-text");
elems.xSelectedTexts = document.querySelectorAll(".widget--x-selected-text");
elems.availableOptionsListItems = document.querySelectorAll(".widget--available-options-list-item");
elems.availableOptionsListInputs = document.querySelectorAll(".widget--available-options-list-item input");
elems.selectedOptionsContainer = document.querySelector(".widget--selected-options-container");
elems.selectedOptionsList = document.querySelector(".widget--selected-options-list");
elems.liveRegion = document.querySelector("[data-live-region]");
elems.eventLogger = document.querySelector(".event-logger");

elems.arrowSelectableElems = [elems.filterInput, ...elems.availableOptionsListItems];
elems.filterInput.addEventListener("input", onFilterInputChange);
elems.filterInput.addEventListener("keyup", onFilterInputKeyup);
elems.filterInput.addEventListener("click", onFilterInputClick);

function onFilterInputClick(event) {
  if (filterInputHasFocus) closeOptionsContainer();
  else openOptionsContainer();
}

function onFilterInputKeyup(event) {
  if (event.key === "Escape") {
    closeOptionsContainer();

    if (document.activeElement === elems.filterInput) {
      elems.unselectAllButton.focus();
    } else {
      elems.filterInput.focus();
    }
  }
}

// We try to optimise the screen reader experience here by trying to fine-tune the live region. In general, `role="alert"` is supported by pretty much all screen reader / browser combos, but it is "rude", as it immediately interrupts the current announcement.
if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) { // https://stackoverflow.com/questions/7000190/
  // When using `role="alert"`, Firefox prefixes each announcement with "alert", which is annoying. Luckily, Firefox supports `aria-live`.
  elems.xOfYForFilterText.setAttribute("aria-live", "polite"); // TODO: Does FF make a difference between polite and assertive?!

// VoiceOver/iOS supports both `role="alert"` as well as `aria-live`. Using `polite`, the announcement is done **after** the pressed key was announced, which is rather cumbersome and slow (the user already knows which key they pressed, I suppose). So I don't see a benefit over using it, because `assertive` has the same effect as `role="alert"`, as far as I see. So let's not handle VoiceOver differently at the moment.
// } else if (/apple/i.test(navigator.vendor)) { // https://stackoverflow.com/questions/7000190/
//   elems.xOfYForFilterText.setAttribute("aria-live", "assertive");

} else {
  // VoiceOver/iOS and Chrome both offer a nice user experience with `role="alert"` (no prefix, immediate announcement).
  // TODO: What about Talkback?
  elems.xOfYForFilterText.setAttribute("role", "alert");
}

let inputName = document.querySelector(".widget--filter-label").innerText.trim();
let filterTerm = "";
let filterTermText = "";
let filterInputHasFocus;
let lastArrowSelectedElem = 0; // TODO: I think we don't really need to manage such a counter, let's just decide on the go which element to select next (which depends on where the focus currently is)!
const textInputRegexp = /^(([a-zA-Z])|(Backspace)|(Delete))$/;
const events = {
  // TODO: Do we need to also prefix them, ie. with `widget--`?
  optionSelected: new CustomEvent("option-selected"),
  optionUnselected: new CustomEvent("option-unselected"),
};

elems.toggleOptionsButton.addEventListener("click", onToggleOptionsButtonClicked);

function onToggleOptionsButtonClicked() {
  isOptionsContainerOpen() ? closeOptionsContainer() : openOptionsContainer();
  elems.filterInput.select();
}

for (let elem of [elems.filterContainer, elems.availableOptionsContainer]) {
  elem.addEventListener("keyup", function (event) {
    if (event.key === "PageDown" || event.key === "PageUp") {
      const shownElems = [...elems.availableOptionsListItems].filter((elem) => !elem.hidden);
      const elemToFocus = shownElems
        .at(event.key === "PageDown" ? -1 : 0)
        .querySelector("input");
      elemToFocus.focus();
    }
  });
}

function onFilterInputChange(event) {
  filterTerm = event.target.value.toLowerCase();
  filterTermText = filterTerm.trim() === "" ? "empty filter" : `filter "${filterTerm}"`

  let numberOfShownOptions = 0;
  for (let optionItem of elems.availableOptionsListItems) {
    optionItem.hidden = !optionItem.innerText.toLowerCase().includes(filterTerm);
    if (!optionItem.hidden) numberOfShownOptions += 1;
  }

  elems.xOfYForFilterText.innerText = `${numberOfShownOptions} of ${elems.availableOptionsListItems.length} options for ${filterTermText}`;

  if (!isOptionsContainerOpen()) openOptionsContainer();
}

elems.widgetContainer.addEventListener("keyup", onKeyup);

function onKeyup(event) {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    if (isOptionsContainerOpen()) {
      const direction = event.key === "ArrowDown" ? 1 : -1;
      for (let i = 0; i < elems.arrowSelectableElems.length; i++) {
        let numberOfArrowSelectableElems = elems.arrowSelectableElems.length;
        let j = modulo(direction * (i + 1) + lastArrowSelectedElem, numberOfArrowSelectableElems);
        let currentElem = elems.arrowSelectableElems[j];
        if (!currentElem.hidden) {
          if (currentElem === elems.filterInput) {
            currentElem.select();
          } else {
            currentElem.querySelector("input").focus();
          }
          break;
        }
      }
    } else {
      openOptionsContainer();
    }
  }

  {
    const { target } = event;
    const { filterInput } = elems;

    if (event.key.match(textInputRegexp)) {
      if (target !== filterInput) {
        if (event.key.match(/^Backspace$/)) {
          filterInput.value = filterInput.value.slice(0, -1);
        } else if (event.key.match(/^Delete$/)) {
          filterInput.value = "";
        } else {
          filterInput.value += event.key;
        }
        filterInput.focus();
        filterInput.dispatchEvent(new Event("input"));
      }
    }
  }
}

elems.filterInput.addEventListener("focus", () => {
  lastArrowSelectedElem = 0;
});

function modulo(a, n) {
  return ((a % n) + n) % n;
}

for (let i = 0; i < elems.availableOptionsListInputs.length; i++) {
  const optionInput = elems.availableOptionsListInputs[i];

  optionInput.addEventListener("input", onOptionChange);
  optionInput.addEventListener("focus", () => {
    lastArrowSelectedElem = i + 1;
  });
  optionInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      const isChecked = optionInput.checked;
      optionInput.checked = !isChecked;
    }
  });
}

function onOptionChange(event) {
  const checkedItems = Array.from(elems.availableOptionsListItems).filter(
    (elem) => elem.querySelector("input").checked
  );

  const checkedItemTexts = checkedItems.map((item) =>
    item.querySelector("label").innerText.trim()
  );

  updateSelectedOptionsList(checkedItemTexts);

  elems.xSelectedTexts.forEach(elem => {
    elem.innerText = `${checkedItems.length}`;
});

  if (checkedItems.length === 0)
    elems.unselectAllButton.setAttribute("hidden", "");
  else elems.unselectAllButton.removeAttribute("hidden");

  if (event?.target) {
    elems.widgetContainer.dispatchEvent(
      new CustomEvent(`option-${event.target.checked ? "" : "un"}selected`, {
        detail: event.target.value,
      })
    );
  }
}

function updateSelectedOptionsList(checkedItemTexts) {
  const allEntries = checkedItemTexts
    .map(
      (
        text
      ) => `<li><button class="widget--selected-options-button" type="button">${text} <img src="clear.svg" alt="unselect">
  </button></li>`
    )
    .join("");
  elems.selectedOptionsList.innerHTML = allEntries;
  elems.selectedOptionsContainer.hidden = checkedItemTexts.length === 0;
}

elems.availableOptionsListInputs.forEach((option) =>
  option.addEventListener("keyup", onOptionKeyup)
);

function onOptionKeyup(event) {
  if (event.key === "Escape") {
    elems.filterInput.focus();
    closeOptionsContainer();
  }
}

elems.unselectAllButton.addEventListener("click", resetOptiones);

elems.unselectAllButton.addEventListener("keyup", onFilterButtonKeyup);

function onFilterButtonKeyup(event) {
  if (event.key === "Escape") elems.filterInput.select();
}

function resetOptiones() {
  for (let option of elems.availableOptionsListInputs) {
    option.checked = false;
  }
  onOptionChange({ target: { checked: false, value: "all optiones" } });
  elems.filterInput.select();
}

elems.selectedOptionsList.addEventListener("click", onSelectedButtonClick);

function onSelectedButtonClick(event) {
  const { target } = event;
  const button = target.classList.contains("widget--selected-options-button")
    ? target
    : target.parentNode.classList.contains("widget--selected-options-button")
    ? target.parentNode
    : undefined;

  if (button?.classList.contains("widget--selected-options-button")) {
    const optionText = button.innerText.trim().toLowerCase();
    const optionItem = Array.from(document.querySelectorAll(".widget--available-options-list-item")).find(
      (item) => item.querySelector("input").value === optionText
    );
    optionItem.querySelector("input").checked = false;

    const selectedButtons = Array.from(
      document.querySelectorAll(".widget--selected-options-button")
    );
    const clickedIndex = selectedButtons.reduce((acc, curr, index) => {
      if (curr.innerText.trim() === optionText) return index;
      else {
        return acc;
      }
    }, -1);

    if (clickedIndex !== -1) {
      const nextIndex =
        selectedButtons.length === 1
          ? -1
          : clickedIndex < selectedButtons.length - 1
          ? clickedIndex
          : clickedIndex - 1;
      if (nextIndex >= 0) {
        setTimeout(() => {
          Array.from(document.querySelectorAll(".widget--selected-options-button"))[
            nextIndex
          ].focus();
        });
      } else elems.filterInput.select();
    }

    onOptionChange({ target: { checked: false, value: optionText } });
  } else {
    return true;
  }
}

function openOptionsContainer() {
  elems.availableOptionsContainer.removeAttribute("hidden");
  elems.filterInput.setAttribute("aria-expanded", true);
  elems.filterAndOptionsContainer.classList.add("widget--open");
  elems.toggleOptionsButtonIcon.alt = `Close ${inputName} options`;

  setTimeout(() => {
    elems.liveRegion.innerHTML += "<span class='widget--instructions'> Use X or Y</span>";
  }, 200);
}

function closeOptionsContainer() {
  elems.availableOptionsContainer.setAttribute("hidden", "");
  elems.filterInput.setAttribute("aria-expanded", false);
  elems.filterAndOptionsContainer.classList.remove("widget--open");
  elems.toggleOptionsButtonIcon.alt = `Open ${inputName} options`;
  
  document.querySelector(".widget--instructions").remove();
}

function isOptionsContainerOpen() {
  return elems.availableOptionsContainer.getAttribute("hidden") === null;
}

document.body.addEventListener("click", (event) => {
  if (
    !isTargetElemInDirectTree({
      event,
      targetElem: elems.filterAndOptionsContainer,
    })
  ) {
    closeOptionsContainer();
  }
});

document.body.addEventListener("keyup", (event) => {
  if (
    event.key === "Tab" &&
    !isTargetElemInDirectTree({
      event,
      targetElem: elems.filterAndOptionsContainer,
    })
  ) {
    closeOptionsContainer();
  }
});

function isTargetElemInDirectTree({ event, targetElem }) {
  let elem = event.target;
  while (elem) {
    if (elem !== targetElem) {
      if (elem.parentNode) elem = elem.parentNode;
      else {
        return false;
      }
    } else return true;
  }
}

elems.widgetContainer.addEventListener(`option-selected`, (event) => {
  elems.eventLogger.innerText =
    event.detail === `all optiones`
      ? `Event: All optiones were unselected`
      : `Event: Option ${event.detail} was ${event.type.split("-")[1]}`;
});

elems.widgetContainer.addEventListener(`option-unselected`, (event) => {
  elems.eventLogger.innerText =
    event.detail === `all optiones`
      ? `Event: All optiones were unselected`
      : `Event: Option ${event.detail} was ${event.type.split("-")[1]}`;
});
