function removeSpaces(str) {
    return str.split(' ').join('');
}

function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


function removeApostrophes(str) {
    return str.split("'").join("");
}