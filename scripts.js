"use strict";

const elems = {};

elems.widgetContainer = document.querySelector(".widget--container");
elems.filterAndOptionsContainer = document.querySelector(".widget--filter-and-options-container");
elems.filterContainer = document.querySelector(".widget--filter-container");
elems.filterInput = document.querySelector(".widget--filter-input");
elems.availableOptionsCounter = document.querySelector(".widget--available-options-counter");
elems.selectedOptionsCounter = document.querySelector(".widget--selected-options-counter");
elems.unselectAllButton = document.querySelector(".widget--unselect-all-button");
elems.unselectAllButtonText = document.querySelector(".widget--unselect-all-button-text");
elems.toggleOptionsButton = document.querySelector(".widget--toggle-options-button");
elems.toggleOptionsButtonIcon = document.querySelector(".widget--toggle-options-button-icon");
elems.availableOptionsContainer = document.querySelector(".widget--available-options-container");
elems.availableOptionsLegend = document.querySelector(".widget--available-options-legend");
elems.availableOptionsListItems = document.querySelectorAll(".widget--available-options-list-item");
elems.availableOptionsListInputs = document.querySelectorAll(".widget--available-options-list-item input");
elems.selectedOptionsContainer = document.querySelector(".widget--selected-options-container");
elems.selectedOptionsLegend = document.querySelector(".widget--selected-options-legend");
elems.selectedOptionsList = document.querySelector(".widget--selected-options-list");
elems.eventLogger = document.querySelector(".event-logger");

elems.arrowSelectableElems = [elems.filterInput, ...elems.availableOptionsListItems];
elems.filterInput.addEventListener("input", onFilterInputChange);
elems.filterInput.addEventListener("keyup", onFilterInputKeyup);
elems.filterInput.addEventListener("click", onFilterInputClick);

function onFilterInputClick(event) {
  if (filterInputHasFocus) hideOptionsContainer();
  else showOptionsContainer();
}

function onFilterInputKeyup(event) {
  if (event.key === "Escape") hideOptionsContainer();
}

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
  isOptionsOpen() ? hideOptionsContainer() : showOptionsContainer();
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
  filterTermText = filterTerm === "" ? "empty filter" : `filter "${filterTerm}"`

  let numberOfShownOptions = 0;
  for (let optionItem of elems.availableOptionsListItems) {
    optionItem.hidden = !optionItem.innerText.toLowerCase().includes(filterTerm);
    if (!optionItem.hidden) numberOfShownOptions += 1;
  }

  elems.availableOptionsCounter.innerText = `${numberOfShownOptions} of ${elems.availableOptionsListItems.length} for ${filterTermText}`;

  if (!isOptionsOpen()) showOptionsContainer();
}

elems.widgetContainer.addEventListener("keyup", onKeyup);

function onKeyup(event) {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    if (isOptionsOpen()) {
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
      showOptionsContainer();
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
  const allItems = Array.from(elems.availableOptionsListItems)

  const checkedItems = Array.from(elems.availableOptionsListItems).filter(
    (elem) => elem.querySelector("input").checked
  );

  const checkedItemTexts = checkedItems.map((item) =>
    item.querySelector("label").innerText.trim()
  );

  elems.unselectAllButtonText.innerHTML = `${checkedItemTexts.length} selected,`;
  elems.availableOptionsLegend.innerHTML = `Available options (${checkedItems.length} selected)`;
  updateSelectedOptionsList(checkedItemTexts);
  elems.selectedOptionsLegend.innerText = `Selected hobbies: ${checkedItemTexts.length} of ${allItems.length}`;
  elems.selectedOptionsCounter.innerText = `${checkedItems.length} selected`;

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
  elems.selectedOptionsCounter.hidden = checkedItemTexts.length === 0;
}

elems.availableOptionsListInputs.forEach((option) =>
  option.addEventListener("keyup", onOptionKeyup)
);

function onOptionKeyup(event) {
  if (event.key === "Escape") {
    elems.unselectAllButton.focus();
    hideOptionsContainer();
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


  // // `aria-live="polite"` is nicer than `role="alert"`, as the latter interrupts the current screen reader output. But only certain browsers support it thoroughly.
  // if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
  //   // Both JAWS and NVDA seem to work with Firefox.
  //   // TODO: What about Talkback and Firefox?
  //   elems.availableHobbiesCounter.setAttribute("aria-live", "polite");
  // } else {
  //   // Let's use `role="alert"` for all other browsers (at least from Chrome+JAWS we know that `aria-live` does not work).
  //   elems.availableHobbiesCounter.setAttribute("role", "alert");
  // }


function showOptionsContainer() {
  elems.availableOptionsContainer.removeAttribute("hidden");
  elems.filterInput.setAttribute("aria-expanded", true);
  elems.filterAndOptionsContainer.classList.add("open");
  elems.toggleOptionsButtonIcon.alt = "Close options";

  // Some screen readers do not announce the `aria-expanded` change, so we give them some additional fodder here: we let them announce the available option's legend by adding making it a live region. Note: does not seem to work for VoiceOver/iOS, but luckily it announces the expanded state.
  setTimeout(() => { // We need a minimal timeout here so screen readers are aware of the role change; otherwise, when showing the container and adding the attribute at the very same instant, the role change seems to be ignored by some screen readers.
    elems.availableOptionsLegend.setAttribute("role", "alert");
  }, 200); // Maybe we do not even need a value here? It seems to work anyway.
}

function hideOptionsContainer() {
  elems.availableOptionsContainer.setAttribute("hidden", "");
  elems.filterInput.setAttribute("aria-expanded", false);
  elems.filterAndOptionsContainer.classList.remove("open");
  elems.toggleOptionsButtonIcon.alt = "Open options";

  elems.availableOptionsLegend.removeAttribute("role", "alert");
}

function isOptionsOpen() {
  return elems.availableOptionsContainer.getAttribute("hidden") === null;
}

document.body.addEventListener("click", (event) => {
  if (
    !isTargetElemInDirectTree({
      event,
      targetElem: elems.filterAndOptionsContainer,
    })
  ) {
    hideOptionsContainer();
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
    hideOptionsContainer();
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
