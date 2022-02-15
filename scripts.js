const elems = {};
let filterTerm = "";

elems.input = document.querySelector("input");
elems.hobbyItems = document.querySelectorAll(".hobby-item");
elems.arrowSelectableElems = [elems.input, ...elems.hobbyItems];
elems.availableHobbiesLegend = document.querySelector(
  ".available-hobbies__legend"
);
elems.hobbyItemInputs = document.querySelectorAll(".hobby-item input");
elems.filterButton = document.querySelector(".filter__button");
elems.filterText = document.querySelector(".filter__text");
elems.selectedList = document.querySelector(".selected__list");
elems.selectedLegend = document.querySelector(".selected__legend");
elems.availableHobbiesCounter = document.querySelector(
  ".available-hobbies__counter"
);

elems.input.addEventListener("input", onInputChange);

function onInputChange(event) {
  filterTerm = event.target.value.toLowerCase();

  let numberOfShownHobbies = 0;
  for (hobbyItem of elems.hobbyItems) {
    hobbyItem.hidden = !hobbyItem.innerText.toLowerCase().includes(filterTerm);
    if (!hobbyItem.hidden) numberOfShownHobbies += 1;
  }

  elems.availableHobbiesCounter.innerText =
    numberOfShownHobbies === 1
      ? "1 option available."
      : `${numberOfShownHobbies} options available.`;
}

let lastSelected = 0;
let numberOfElems = elems.arrowSelectableElems.length;

document.addEventListener("keyup", onKeyup);

function onKeyup(event) {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    const direction = event.key === "ArrowDown" ? 1 : -1;
    for (let i = 0; i < elems.arrowSelectableElems.length; i++) {
      let j = modulo(direction * (i + 1) + lastSelected, numberOfElems);
      let currentElem = elems.arrowSelectableElems[j];
      console.log(j);
      if (!currentElem.hidden) {
        lastSelected = j;
        let elemToFocus =
          currentElem === elems.input
            ? elems.input
            : currentElem.querySelector("input");
        elemToFocus.focus();
        break;
      }
    }
  }
}

elems.input.addEventListener("focus", () => (lastSelected = 0));

function modulo(a, n) {
  return ((a % n) + n) % n;
}

for (checkboxInput of elems.hobbyItemInputs) {
  checkboxInput.addEventListener("input", onCheckboxChange);
}

function onCheckboxChange() {
  const checkedItems = Array.from(elems.hobbyItems).filter(
    (elem) => elem.querySelector("input").checked
  );

  const checkedItemTexts = checkedItems.map((item) =>
    item.querySelector("label").innerText.trim()
  );

  elems.availableHobbiesLegend.innerHTML = `Available hobbies (${checkedItems.length} selected})`;
  elems.filterText.innerHTML = composeFilteringButtonText(checkedItemTexts);
  updateSelectedList(checkedItemTexts);
  elems.selectedLegend.innerText = `Selected hobbies (${checkedItemTexts.length} in total)`;
}

function composeFilteringButtonText(checkboxLabels) {
  const numberOfOptions = checkboxLabels.length;

  return `${numberOfOptions} ${
    numberOfOptions === 0
      ? "options selected."
      : numberOfOptions === 1
      ? "option selected."
      : "options selected."
  }`;
}

function updateSelectedList(checkedItemTexts) {
  const allEntries = checkedItemTexts
    .map((text) => `<li><button type="button">${text} (X)</button></li>`)
    .join("");
  elems.selectedList.innerHTML = allEntries;
}

elems.hobbyItemInputs.forEach((checkbox) =>
  checkbox.addEventListener("keyup", onCheckboxKeyup)
);

function onCheckboxKeyup(event) {
  if (event.key === "Escape") elems.filterButton.focus();
}

elems.filterButton.addEventListener("click", resetCheckboxes);

function resetCheckboxes(event) {
  for (checkbox of elems.hobbyItemInputs) {
    checkbox.checked = false;
  }
  onCheckboxChange();
  elems.input.focus();
}
