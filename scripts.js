const elems = {};
let filterTerm = '';

elems.input = document.querySelector("input");
elems.hobbyItems = document.querySelectorAll(".hobby-item");

elems.input.addEventListener('input', onInputChange)

function onInputChange(event) {
    filterTerm = event.target.value.toLowerCase();

    for (hobbyItem of elems.hobbyItems) {
        hobbyItem.hidden = !hobbyItem.innerText.toLowerCase().includes(filterTerm)
    }

}
