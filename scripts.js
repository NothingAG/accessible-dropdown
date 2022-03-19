"use strict";

const elems = {};

elems.widgetContainer = document.querySelector(".widget--container");
elems.filterAndOptionsContainer = document.querySelector(".widget--filter-and-options-container");
elems.filter = document.querySelector(".filter");
elems.options = document.querySelector(".options");
elems.hobbyItems = document.querySelectorAll(".hobby-item");
elems.availableHobbiesLegend = document.querySelector(
  ".available-hobbies__legend"
);
elems.hobbyItemInputs = document.querySelectorAll(".hobby-item input");
elems.filterField = document.querySelector(".filter__field");
elems.filterResetOptions = document.querySelector(".filter__reset-options");
elems.filterText = document.querySelector(".filter__text");
elems.filterCloseOptions = document.querySelector(".filter__close-options");
elems.selected = document.querySelector(".selected");
elems.selectedList = document.querySelector(".selected__list");
elems.selectedLegend = document.querySelector(".selected__legend");
elems.availableHobbiesCounter = document.querySelector(
  ".available-hobbies__counter"
);
elems.availableHobbiesSelectedCounter = document.querySelector(
  ".available-hobbies__selected-counter"
);
elems.eventLogger = document.querySelector(".event-logger");

elems.arrowSelectableElems = [elems.filterField, ...elems.hobbyItems];
elems.filterField.addEventListener("input", onFilterFieldChange);
elems.filterField.addEventListener("input", onFilterFieldChangeOnce);
elems.filterField.addEventListener("keyup", onFilterFieldKeyup);
elems.filterField.addEventListener("click", onFilterFieldClick);

function onFilterFieldClick(event) {
  if (filterFieldHasFocus) closeOptions();
  else openOptions();
}

function onFilterFieldKeyup(event) {
  if (event.key === "Escape") closeOptions();
}

let filterTerm = "";
let filterFieldHasFocus;
let lastSelected = 0;
let numberOfElems = elems.arrowSelectableElems.length;
const textInputRegexp = /^(([a-zA-Z])|(Backspace)|(Delete))$/;
const events = {
  optionSelected: new CustomEvent("option-selected"),
  optionUnselected: new CustomEvent("option-unselected"),
};

elems.filterCloseOptions.addEventListener("click", onFilterCloseOptionsClicked);

function onFilterCloseOptionsClicked() {
  isOptionsOpen() ? closeOptions() : openOptions();
  elems.filterField.select();
}

for (let elem of [elems.filter, elems.options]) {
  elem.addEventListener("keyup", function (event) {
    if (event.key === "PageDown" || event.key === "PageUp") {
      const shownElems = [...elems.hobbyItems].filter((elem) => !elem.hidden);
      const elemToFocus = shownElems
        .at(event.key === "PageDown" ? -1 : 0)
        .querySelector("input");
      elemToFocus.focus();
    }
  });
}

function onFilterFieldChange(event) {
  filterTerm = event.target.value.toLowerCase();

  let numberOfShownHobbies = 0;
  for (let hobbyItem of elems.hobbyItems) {
    hobbyItem.hidden = !hobbyItem.innerText.toLowerCase().includes(filterTerm);
    if (!hobbyItem.hidden) numberOfShownHobbies += 1;
  }

  elems.availableHobbiesCounter.innerText = `${numberOfShownHobbies} option${
    numberOfShownHobbies === 1 ? "" : "s"
  } available for ${filterTerm}`;

  openOptions();
}

function onFilterFieldChangeOnce() {
  elems.availableHobbiesCounter.setAttribute("role", "alert");
  elems.filterField.removeEventListener("input", onFilterFieldChangeOnce);
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
          if (currentElem === elems.filterField) {
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
    const { filterField } = elems;

    if (event.key.match(textInputRegexp)) {
      if (target !== filterField) {
        if (event.key.match(/^Backspace$/)) {
          filterField.value = filterField.value.slice(0, -1);
        } else if (event.key.match(/^Delete$/)) {
          filterField.value = "";
        } else {
          filterField.value += event.key;
        }
        filterField.focus();
        filterField.dispatchEvent(new Event("input"));
      }
    }
  }
}

elems.filterField.addEventListener("focus", () => {
  lastSelected = 0;
});

function modulo(a, n) {
  return ((a % n) + n) % n;
}

for (let i = 0; i < elems.hobbyItemInputs.length; i++) {
  const checkboxInput = elems.hobbyItemInputs[i];

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
  const checkedItems = Array.from(elems.hobbyItems).filter(
    (elem) => elem.querySelector("input").checked
  );

  const checkedItemTexts = checkedItems.map((item) =>
    item.querySelector("label").innerText.trim()
  );

  elems.availableHobbiesLegend.innerHTML = `Available hobbies (${checkedItems.length} selected)`;
  elems.filterText.innerHTML = composeFilteringButtonText(checkedItemTexts);
  updateSelectedList(checkedItemTexts);
  elems.selectedLegend.innerText = `Selected hobbies (${checkedItemTexts.length} in total)`;
  elems.availableHobbiesSelectedCounter.innerText = `${checkedItems.length} selected.`;

  if (checkedItems.length === 0)
    elems.filterResetOptions.setAttribute("hidden", "");
  else elems.filterResetOptions.removeAttribute("hidden");

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
      ) => `<li><button class="selected__button" type="button">${text} <img src="clear.svg" alt="unselect">
  </button></li>`
    )
    .join("");
  elems.selectedList.innerHTML = allEntries;
  elems.selected.hidden = checkedItemTexts.length === 0;
}

elems.hobbyItemInputs.forEach((checkbox) =>
  checkbox.addEventListener("keyup", onCheckboxKeyup)
);

function onCheckboxKeyup(event) {
  if (event.key === "Escape") {
    elems.filterResetOptions.focus();
    closeOptions();
  }
}

elems.filterResetOptions.addEventListener("click", resetCheckboxes);

elems.filterResetOptions.addEventListener("keyup", onFilterButtonKeyup);

function onFilterButtonKeyup(event) {
  if (event.key === "Escape") elems.filterField.select();
}

function resetCheckboxes() {
  for (let checkbox of elems.hobbyItemInputs) {
    checkbox.checked = false;
  }
  onCheckboxChange({ target: { checked: false, value: "all checkboxes" } });
  elems.filterField.select();
}

elems.selectedList.addEventListener("click", onSelectedButtonClick);

function onSelectedButtonClick(event) {
  const { target } = event;
  const button = target.classList.contains("selected__button")
    ? target
    : target.parentNode.classList.contains("selected__button")
    ? target.parentNode
    : undefined;

  if (button?.classList.contains("selected__button")) {
    const optionText = button.innerText.trim().toLowerCase();
    const hobbyItem = Array.from(document.querySelectorAll(".hobby-item")).find(
      (item) => item.querySelector("input").value === optionText
    );
    hobbyItem.querySelector("input").checked = false;

    const selectedButtons = Array.from(
      document.querySelectorAll(".selected__button")
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
          Array.from(document.querySelectorAll(".selected__button"))[
            nextIndex
          ].focus();
        });
      } else elems.filterField.select();
    }

    onCheckboxChange({ target: { checked: false, value: optionText } });
  } else {
    return true;
  }
}

function openOptions() {
  elems.options.removeAttribute("hidden");
  elems.filterField.setAttribute("aria-expanded", true);
  elems.filterAndOptionsContainer.classList.add("open");
}

function closeOptions() {
  elems.options.setAttribute("hidden", "");
  elems.filterField.setAttribute("aria-expanded", false);
  elems.filterAndOptionsContainer.classList.remove("open");
}

function isOptionsOpen() {
  return elems.options.getAttribute("hidden") === null;
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
