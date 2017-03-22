const
    hidenseek   = require('./hidenseek'),
    Pokemon     = require('./pokemon'),
    PokemonList = require('./pokemonlist'),

    fs          = require('fs');


const
    args = process.argv.slice(2),

    // method call from the command line
    app = {
        hide: args => {
            let folder = args[1],
                file = args[2];

            if (folder && file) {
                try {
                    let pokemons = require(file).pokemons;

                    if (pokemons) {
                        hidenseek.hide(
                            folder,
                            new PokemonList(
                                ...pokemons.map(item => new Pokemon(item.name, item.level))
                            )
                        );
                    }
                } catch (err) {
                    console.log(`EXCEPTION\n${err.message}`);
                }
            } else {
                console.log('hide bad params: "node index hide <folder> <json file>"');
            }
        },

        seek: args => {
            let folder = args[1];

            folder ? hidenseek.seek(folder) : console.log('seek bad params: "node index seek <folder>"');
        }
    };


if (args.length) {
    app.hasOwnProperty(args[0]) ? app[args[0]](args) : console.log('bad params: hide or seek');
} else {
    console.log('"node index" - help');
    console.log('"node index hide <folder> <json file>" - hide pokemons from json file');
    console.log('"node index seek <folder>" - find pokemons in the folder');
}