const Pokemon = require('./pokemon');

module.exports = class PokemonList extends Array {
    constructor(...pokemons) {
        super(...pokemons);
    }

    show() {
        console.log(`number: ${this.length}`);
        for (let item of this) {
            item.show();
        }
    }

    add(name, level) {
        this.push(
            new Pokemon(name, level)
        )
    }

    max() {
        return this.reduce(
            (prev, current) => prev > current ? prev : current
        );
    }
}
