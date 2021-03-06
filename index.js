const hidenseek   = require('./hidenseek');
const Pokemon     = require('./pokemon');
const PokemonList = require('./pokemonlist');

const fs          = require('fs');


const args = process.argv.slice(2);

let getPokemons = pokemons => pokemons.map(item => new Pokemon(item.name, item.level));

// method call from the command line
const app = {
    hide: args => {
        let folder = args[1];
        let file = args[2];

        if (folder && file) {
            try {
                let pokemons = require(file).pokemons;

                if (pokemons) {
                    hidenseek.hide(folder, new PokemonList(...getPokemons(pokemons)))
                    .then(
                        result => {
                            console.log('hidden pokemons');
                            result.show();
                        }
                    )
                    .catch(error => console.error(`EXCEPTION\n${error}`));
                }
            } catch (error) {
                console.log(`EXCEPTION\n${error}`);
            }
        } else {
            console.error('hide bad params: "node index hide <folder> <json file>"');
        }
    },

    seek: args => {
        let folder = args[1];

        if (folder) {
            hidenseek.seek(folder)
            .then(
                result => {
                    result.show();
                }
            )
            .catch(error => console.error(`EXCEPTION\n${error}`)
            );
        } else {
            console.log('seek bad params: "node index seek <folder>"');
        }
    }
};


if (args.length) {
    app.hasOwnProperty(args[0]) ? app[args[0]](args) : console.log('bad params: hide or seek');
} else {
    console.log('"node index" - help');
    console.log('"node index hide <folder> <json file>" - hide pokemons from json file');
    console.log('"node index seek <folder>" - find pokemons in the folder');
}