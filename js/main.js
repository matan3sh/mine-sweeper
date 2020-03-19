'use strict';

var gBoard = [];
var gLevel = {
    SIZE: 4,
    MINES: 4
}
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}
var gGameOver = false
var gStopWatch
var gMinutes = 0
var gHints = 3
var gLives = 3

const EMPTY = '';
const MINE = '&#128163'
const FLAG = '&#128681;'
const HINT = '&#128161;'
const SMILEY_NORMAL = '&#128515;'
const SMILEY_LOSE = '&#128532;'
const SMILEY_WIN = '&#128526;'
const LIVES = '&#128156;'

function init() {
    clearInterval(gStopWatch)
    showFeatures()
    buildBoard()
    renderHints(gHints)
    renderBoard()
}

function buildBoard() {
    gBoard = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        gBoard.push([]);
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
        }
    }
}

function renderBoard() {
    var elContainer = document.querySelector('.matrix');
    var strHTML = '<table border="1"><tbody>';
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < gLevel.SIZE; j++) {
            var className = 'cell';
            var id = 'td ' + i + '-' + j;
            var onClick = ' onClick=cellClicked(this)';
            var onRightMouseClick = ' oncontextmenu=flagClick(this)'
            var textInCell = EMPTY;
            strHTML += '<td id ="' + id + '" class="' + className + '"' + onClick + onRightMouseClick + '> ' + textInCell + ' </td>';
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    elContainer.innerHTML = strHTML;
}

function firstClick(row, col) {
    setMinesNegsCount(row, col)
    gStopWatch = setInterval(stopWatch, 1000)
}


function cellClicked(elCell) {
    var cellOnBoard = toNumber(getCellCoord(elCell))
    var cell = gBoard[cellOnBoard[0]][cellOnBoard[1]]
    
    if (gGameOver) return
    if (gGame.isOn) {
        gGame.isOn = false
        
        // set mines after first click
        setMinesInRandomCell()
        firstClick(cellOnBoard[0], cellOnBoard[1])
    }
    if (cell.isMarked) return
    if (cell.isMine) {
        // Update Model
        cell.isShown = true
        
        // Update DOM
        elCell.innerHTML = MINE
        elCell.classList.add('marked')
        
        // check if there is lives to user
        if (checkLives(elCell)) return
        else {
            gGame.isOn = false
            gGameOver = true
            document.querySelector('.smiley').innerHTML = SMILEY_LOSE
            clearInterval(gStopWatch)
        }
    } else {
        // Update Modal
        cell.isShown = true
        gGame.shownCount++
        
        // Update DOM
        elCell.innerHTML = cell.minesAroundCount
        elCell.classList.add('marked')
        
        if (isFinished()) {
            // Update DOM
            console.log('WIN', getGameTime())
            calcBestTime()
            document.querySelector('.smiley').innerHTML = SMILEY_WIN
            gGameOver = true
            gGame.isOn = false
            clearInterval(gStopWatch)
        }
        if (cell.minesAroundCount === 0) expandShown(elCell)
    }
    
}


function setMinesInRandomCell() {
    for (var i = 0; i < gLevel.MINES; i++) {
        var row = getRandomIntInclusive(0, gLevel.SIZE - 1)
        var col = getRandomIntInclusive(0, gLevel.SIZE - 1)
        if (!gBoard[row][col].isMine) {
            gBoard[row][col].isMine = true
            setMinesNegsCount(row, col)
        }
    }
}

// check if around cell neighbors there is a mine
function setMinesNegsCount(mineRow, mineCol) {
    for (var i = mineRow - 1; i <= mineRow + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue
        for (var j = mineCol - 1; j <= mineCol + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue
            if (i === mineRow && j === mineCol) continue
            gBoard[i][j].minesAroundCount++
        }
    }
}

// display neighbors while there is no mine around
function expandShown(elCurrCell) {
    var cellOnBoard = toNumber(getCellCoord(elCurrCell))
    
    for (var i = cellOnBoard[0] - 1; i <= cellOnBoard[0] + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue
        for (var j = cellOnBoard[1] - 1; j <= cellOnBoard[1] + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue
            if (i === cellOnBoard[0] && j === cellOnBoard[1]) continue
            if (gBoard[i][j].isShown) continue;
            var id = 'td ' + (i) + '-' + (j);
            
            // Update Model
            gBoard[i][j].isShown = true;
            
            // Update DOM
            var elNegCell = document.getElementById(id);
            elNegCell.innerHTML = gBoard[i][j].minesAroundCount
            elNegCell.classList.add('marked')
            
            gGame.shownCount++
            
            if (!gBoard[i][j].minesAroundCount) {
                expandShown(elNegCell)
            }
        }
    }
}

function flagClick(elCell) {
    var cellOnBoard = toNumber(getCellCoord(elCell))
    var cell = gBoard[cellOnBoard[0]][cellOnBoard[1]]
    
    if (cell.isShown) return
    else {
        if (!cell.isMarked) {
            // Update Modal
            cell.isMarked = true
            
            // Update DOM
            elCell.innerHTML = FLAG
        } else {
            // Update Modal
            cell.isMarked = false
            
            // Update DOM
            elCell.innerHTML = EMPTY
        }
    }
}

function checkLives(currCell){
    var elLives = document.querySelector('.lives');
    if(gLives === 3) {
        elLives.innerHTML = LIVES + LIVES
        setTimeout(function () {
            currCell.classList.remove('marked')
        }, 1000)
        gLives--
        return true
    }
    else if (gLives === 2) {
        elLives.innerHTML = LIVES
        setTimeout(function () {
            currCell.classList.remove('marked')
        }, 1000)
        gLives--
        return true
    }
    else if (gLives === 1) {
        elLives.innerHTML = ''
        setTimeout(function () {
            currCell.classList.remove('marked')
        }, 1000)
        gLives--
        return true
    }
    return false
}

function isFinished() {
    return gGame.shownCount === getCellWithoutMines()
}

function restartGame() {
    gBoard = null;
    gGame.shownCount = 0;
    gGame.isOn = true;
    gGame.secsPassed = 0
    gGameOver = false
    gMinutes = 0
    gHints = 3
    gLives = 3
    clearInterval(gStopWatch)
    init()
}

function renderHints(hints) {
    var strHTML = ''
    var elHints = document.querySelector('.hints')
    if (hints === 0) elHints.innerHTML = strHTML
    else {
        for (var i = 0; i < hints; i++) {
            strHTML += `<div class="hint" onClick="getHint()">${HINT}</div>\n`
        }
        elHints.innerHTML = strHTML
    }
}

function getHint() {
    var randRow = getRandomIntInclusive(0, gLevel.SIZE - 1);
    var randCol = getRandomIntInclusive(0, gLevel.SIZE - 1);
    var findCell = false

    for (var i = randRow; i < gLevel.SIZE; i++) {
        for (var j = randCol; j < gLevel.SIZE; j++) {
            if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked && !gBoard[i][j].isMine) {
                var id = 'td ' + i + '-' + j;
                var cell = document.getElementById(id)
                cell.classList.add('hint-marked')
                setTimeout(function () {
                    cell.classList.remove('hint-marked')
                }, 1000)
                gHints--
                findCell = true
                renderHints(gHints)
            }
            if (findCell) return
        }
    }
}

function stopWatch() {
    gGame.secsPassed++;
    if (gGame.secsPassed === 60) {
        gGame.secsPassed = 0
        gMinutes++
    }
    if (gGame.secsPassed < 10) gGame.secsPassed = '0' + gGame.secsPassed
    document.querySelector('.stop-watch').innerHTML = gMinutes + ':' + gGame.secsPassed;
}

function showFeatures(){
    var storedGameTime = localStorage.getItem('gameTime');
    if (storedGameTime!== null) document.querySelector('.best-game-time h2').innerHTML = ("Your best time is " + storedGameTime);

    document.querySelector('.lives').innerHTML = LIVES + LIVES + LIVES
    document.querySelector('.stop-watch').innerHTML = gMinutes + ': 0' + gGame.secsPassed;
    document.querySelector('.smiley').innerHTML = SMILEY_NORMAL
}

function saveGameTime() {
    localStorage.setItem('gameTime', gMinutes + ':' + gGame.secsPassed);
}

function getGameTime() {
    return gMinutes + ' min and ' + gGame.secsPassed + ' sec'
}

function calcBestTime() {
    var storedGameTime = localStorage.getItem('gameTime')
    
    if (storedGameTime === null) {
        var temp = handleGameTimeInLocalStorage('')
        saveGameTime()
        document.querySelector('.best-game-time h2').innerHTML = ("Your best time is " + gMinutes + ':' + gGame.secsPassed);
    } else {
        var temp = handleGameTimeInLocalStorage(storedGameTime)
        if (temp[0] > gMinutes) {
            saveGameTime()
            document.querySelector('.best-game-time h2').innerHTML = ("Your best time is " + gMinutes + ':' + gGame.secsPassed);
        }
        else if (temp[1] > gGame.secsPassed) {
            saveGameTime()
            document.querySelector('.best-game-time h2').innerHTML = ("Your best time is " + gMinutes + ':' + gGame.secsPassed);
        }
        else {
            document.querySelector('.best-game-time h2').innerHTML = ("Your best time is " + storedGameTime);
        }
    }

}