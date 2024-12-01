// scuffed impl of an interface
const { add: addLie, count: countLies, set: setLies, top: topLies, pure: pureLies } = require("../../backend/neon");

async function add(uid) {
    return addLie(uid);
}

async function count(uid) {
    return countLies(uid);
}

async function set(uid, newCount) {
    return setLies(uid, newCount);
}

async function top() {
    return topLies();
}

async function pure() {
    return pureLies();
}

module.exports = {
    add,
    count,
    set,
    top,
    pure
}