module.exports = class Pokemon {
    constructor(name, level) {
        this.name = name.toString();
        this.level = Number.isInteger(level) && level > 0 ? level : 1;
    }

    show() {
        console.log(`name: ${this.name}, level: ${this.level}`);
    }

    toString() {
        return `${this.name}|${this.level}`;
    }
}