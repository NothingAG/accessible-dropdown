"use strict";

const elems = {};

elems.widgetContainer = document.querySelector(".widget--container");
elems.filterAndOptionsContainer = document.querySelector(".widget--filter-and-options-container");
elems.filterContainer = document.querySelector(".widget--filter-container");
elems.filterInput = document.querySelector(".widget--filter-input");
elems.availableOptionsCounter = document.querySelector(
  ".widget--available-options-counter"
);
elems.selectedOptionsCounter = document.querySelector(
  ".widget--selected-options-counter"
);
elems.unselectAllButton = document.querySelector(".widget--unselect-all-button");
elems.unselectAllButtonText = document.querySelector(".widget--unselect-all-button-text");
elems.toggleOptionsButton = document.querySelector(".widget--toggle-options-button");
elems.availableOptionsContainer = document.querySelector(".widget--available-options-container");
elems.optionsLegend = document.querySelector(
  ".widget--options-legend"
);
elems.optionsListItems = document.querySelectorAll(".widget--options-list-item");
elems.optionsListInputs = document.querySelectorAll(".widget--options-list-item input");
elems.selectedOptionsContainer = document.querySelector(".widget--selected-options-container");
elems.selectedOptionsLegend = document.querySelector(".widget--selected-options-legend");
elems.selectedOptionsList = document.querySelector(".widget--selected-options-list");
elems.eventLogger = document.querySelector(".event-logger");

elems.arrowSelectableElems = [elems.filterInput, ...elems.optionsListItems];
elems.filterInput.addEventListener("input", onFilterInputChange);
elems.filterInput.addEventListener("input", onFilterInputChangeOnce);
elems.filterInput.addEventListener("keyup", onFilterInputKeyup);
elems.filterInput.addEventListener("click", onFilterInputClick);

function onFilterInputClick(event) {
  if (FilterInputHasFocus) closeOptions();
  else openOptions();
}

function onFilterInputKeyup(event) {
  if (event.key === "Escape") closeOptions();
}

let filterTerm = "";
let FilterInputHasFocus;
let lastSelected = 0;
let numberOfElems = elems.arrowSelectableElems.length;
const textInputRegexp = /^(([a-zA-Z])|(Backspace)|(Delete))$/;
const events = {
  optionSelected: new CustomEvent("option-selected"),
  optionUnselected: new CustomEvent("option-unselected"),
};

elems.toggleOptionsButton.addEventListener("click", onToggleOptionsButtonClicked);

function onToggleOptionsButtonClicked() {
  isOptionsOpen() ? closeOptions() : openOptions();
  elems.filterInput.select();
}

for (let elem of [elems.filterContainer, elems.availableOptionsContainer]) {
  elem.addEventListener("keyup", function (event) {
    if (event.key === "PageDown" || event.key === "PageUp") {
      const shownElems = [...elems.optionsListItems].filter((elem) => !elem.hidden);
      const elemToFocus = shownElems
        .at(event.key === "PageDown" ? -1 : 0)
        .querySelector("input");
      elemToFocus.focus();
    }
  });
}

function onFilterInputChange(event) {
  filterTerm = event.target.value.toLowerCase();

  let numberOfShownHobbies = 0;
  for (let hobbyItem of elems.optionsListItems) {
    hobbyItem.hidden = !hobbyItem.innerText.toLowerCase().includes(filterTerm);
    if (!hobbyItem.hidden) numberOfShownHobbies += 1;
  }

  elems.availableOptionsCounter.innerText = `${numberOfShownHobbies} option${
    numberOfShownHobbies === 1 ? "" : "s"
  } available for ${filterTerm}`;

  openOptions();
}

function onFilterInputChangeOnce() {
  elems.availableOptionsCounter.setAttribute("role", "alert");
  elems.filterInput.removeEventListener("input", onFilterInputChangeOnce);
}

elems.widgetContainer.addEventListener("keyup", onKeyup);

function onKeyup(event) {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    if (isOptionsOpen()) {
      const direction = event.key === "ArrowDown" ? 1 : -1;
      for (let i = 0; i < elems.arrowSelectableElems.length; i++) {
        let j = modulo(direction * (i + 1) + lastSelected, numberOfElems);
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
      openOptions();
    }
  }

  {
    const { target } = event;
    const { FilterInput } = elems;

    if (event.key.match(textInputRegexp)) {
      if (target !== FilterInput) {
        if (event.key.match(/^Backspace$/)) {
          FilterInput.value = FilterInput.value.slice(0, -1);
        } else if (event.key.match(/^Delete$/)) {
          FilterInput.value = "";
        } else {
          FilterInput.value += event.key;
        }
        FilterInput.focus();
        FilterInput.dispatchEvent(new Event("input"));
      }
    }
  }
}

elems.filterInput.addEventListener("focus", () => {
  lastSelected = 0;
});

function modulo(a, n) {
  return ((a % n) + n) % n;
}

for (let i = 0; i < elems.optionsListInputs.length; i++) {
  const checkboxInput = elems.optionsListInputs[i];

  checkboxInput.addEventListener("input", onCheckboxChange);
  checkboxInput.addEventListener("focus", () => {
    lastSelected = i + 1;
  });
  checkboxInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      const isChecked = checkboxInput.checked;
      checkboxInput.checked = !isChecked;
    }
  });
}

function onCheckboxChange(event) {
  const checkedItems = Array.from(elems.optionsListItems).filter(
    (elem) => elem.querySelector("input").checked
  );

  const checkedItemTexts = checkedItems.map((item) =>
    item.querySelector("label").innerText.trim()
  );

  elems.optionsLegend.innerHTML = `Available hobbies (${checkedItems.length} selected)`;
  elems.unselectAllButtonText.innerHTML = composeFilteringButtonText(checkedItemTexts);
  updateSelectedList(checkedItemTexts);
  elems.selectedOptionsLegend.innerText = `Selected hobbies (${checkedItemTexts.length} in total)`;
  elems.selectedOptionsCounter.innerText = `${checkedItems.length} selected.`;

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

function composeFilteringButtonText(checkboxLabels) {
  const numberOfOptions = checkboxLabels.length;

  return `${numberOfOptions} ${
    numberOfOptions === 0
      ? "options selected, "
      : numberOfOptions === 1
      ? "option selected "
      : "options selected, "
  }`;
}

function updateSelectedList(checkedItemTexts) {
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

elems.optionsListInputs.forEach((checkbox) =>
  checkbox.addEventListener("keyup", onCheckboxKeyup)
);

function onCheckboxKeyup(event) {
  if (event.key === "Escape") {
    elems.unselectAllButton.focus();
    closeOptions();
  }
}

elems.unselectAllButton.addEventListener("click", resetCheckboxes);

elems.unselectAllButton.addEventListener("keyup", onFilterButtonKeyup);

function onFilterButtonKeyup(event) {
  if (event.key === "Escape") elems.filterInput.select();
}

function resetCheckboxes() {
  for (let checkbox of elems.optionsListInputs) {
    checkbox.checked = false;
  }
  onCheckboxChange({ target: { checked: false, value: "all checkboxes" } });
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
    const hobbyItem = Array.from(document.querySelectorAll(".widget--options-list-item")).find(
      (item) => item.querySelector("input").value === optionText
    );
    hobbyItem.querySelector("input").checked = false;

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

    onCheckboxChange({ target: { checked: false, value: optionText } });
  } else {
    return true;
  }
}

function openOptions() {
  elems.availableOptionsContainer.removeAttribute("hidden");
  elems.filterInput.setAttribute("aria-expanded", true);
  elems.filterAndOptionsContainer.classList.add("open");
}

function closeOptions() {
  elems.availableOptionsContainer.setAttribute("hidden", "");
  elems.filterInput.setAttribute("aria-expanded", false);
  elems.filterAndOptionsContainer.classList.remove("open");
}

function isOptionsOpen() {
  return elems.availableOptionsContainer.getAttribute("hidden") === null;
}

document.body.addEventListener("click", (event) => {
  if (
    !isTargetElementInDirectTree({
      event,
      targetElement: elems.filterAndOptionsContainer,
    })
  ) {
    closeOptions();
  }
});

document.body.addEventListener("keyup", (event) => {
  if (
    event.key === "Tab" &&
    !isTargetElementInDirectTree({
      event,
      targetElement: elems.filterAndOptionsContainer,
    })
  ) {
    closeOptions();
  }
});

function isTargetElementInDirectTree({ event, targetElement }) {
  let elem = event.target;
  while (elem) {
    if (elem !== targetElement) {
      if (elem.parentNode) elem = elem.parentNode;
      else {
        return false;
      }
    } else return true;
  }
}

elems.widgetContainer.addEventListener(`option-selected`, (event) => {
  elems.eventLogger.innerText =
    event.detail === `all checkboxes`
      ? `Event: All checkboxes were unselected`
      : `Event: Option ${event.detail} was ${event.type.split("-")[1]}`;
});

elems.widgetContainer.addEventListener(`option-unselected`, (event) => {
  elems.eventLogger.innerText =
    event.detail === `all checkboxes`
      ? `Event: All checkboxes were unselected`
      : `Event: Option ${event.detail} was ${event.type.split("-")[1]}`;
});
