function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

// function to get cell coordinates by id as rendered
function getCellCoord(elCell) {
    return elCell.id.replace('td ', '').split('-');
}

// function to convert all the strings elements in the array to numbers
function toNumber(arrayOfStrings) {
    res = []
    for (var i = 0; i < arrayOfStrings.length; i++) res.push(+arrayOfStrings[i])
    return res
}

// function to get the number of cells without mines
function getCellWithoutMines() {
    return (gLevel.SIZE * gLevel.SIZE) - gLevel.MINES
}

// disable right mouse click for expand dropdown menu on click
document.oncontextmenu = document.body.oncontextmenu = function () { return false; }

function handleGameTimeInLocalStorage(str) {
    if (str === null) return
    else {
        var temp = str.split(':');
        return temp
    }
}