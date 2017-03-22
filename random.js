// random integer number
integer = (min, max) => {
    let rand = min + Math.random() * (max + 1 - min);

    rand = Math.floor(rand);

    return rand;
},

 // generating an array of unique random numbers
array = (min, max, length) => {
    let last = [],
        number = min - 1;

    return [...new Array(length)].map(() => {
        do {
            last.push(number);
            number = integer(min, max);
        } while (last.includes(number))

        return number;
    });
}

module.exports = {
    integer,
    array
}