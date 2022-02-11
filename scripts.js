const elems = {};
let filterTerm = "";

elems.input = document.querySelector("input");
elems.hobbyItems = document.querySelectorAll(".hobby-item");

elems.input.addEventListener("input", onInputChange);

function onInputChange(event) {
  filterTerm = event.target.value.toLowerCase();

  for (hobbyItem of elems.hobbyItems) {
    hobbyItem.hidden = !hobbyItem.innerText.toLowerCase().includes(filterTerm);
  }
}

elems.arrowSelectableElems = [elems.input, ...elems.hobbyItems];
let lastSelected = 0;
let numberOfElems = elems.arrowSelectableElems.length;

document.addEventListener("keyup", onKeyup);

function onKeyup(event) {
  let currentlySelectable = elems.arrowSelectableElems.filter(
    (elem) => !elem.hidden
  );

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
