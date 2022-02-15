const elems = {};
let filterTerm = "";

elems.hobbyItems = document.querySelectorAll(".hobby-item");
elems.availableHobbiesLegend = document.querySelector(
  ".available-hobbies__legend"
);
elems.hobbyItemInputs = document.querySelectorAll(".hobby-item input");
elems.filterField = document.querySelector(".filter__field");
elems.filterButton = document.querySelector(".filter__button");
elems.filterText = document.querySelector(".filter__text");
elems.selectedList = document.querySelector(".selected__list");
elems.selectedLegend = document.querySelector(".selected__legend");
elems.availableHobbiesCounter = document.querySelector(
  ".available-hobbies__counter"
);

elems.arrowSelectableElems = [elems.filterField, ...elems.hobbyItems];
elems.filterField.addEventListener("input", onInputChange);

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
      if (!currentElem.hidden) {
        lastSelected = j;
        console.log(lastSelected);
        if (currentElem === elems.filterField) {
          currentElem.select();
        } else {
          currentElem.querySelector("input").focus();
        }
        break;
      }
    }
  }
}

elems.filterField.addEventListener("focus", () => (lastSelected = 0));

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
    .map(
      (
        text
      ) => `<li><button type="button">${text} <img src="clear.svg" alt="unselect">
  </button></li>`
    )
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
  elems.filterField.select();
}
