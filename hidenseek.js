const PokemonList    = require('./pokemonlist');
const Pokemon        = require('./pokemon');
const random         = require('./random');
const rmDirRecursive = require('./rmdirrecursive');

const pth            = require('path');
const fs             = require('fs');

let numberPath = number => number !== 10 ? '0' + number : number + '';

 // get random pokemons from list
let selectRandomPokemons = (pokemonList, number) => {
    let randomPokemons = random.array(0, pokemonList.length - 1, number);

    return randomPokemons.map(item => pokemonList[item]);
};

// create folders for pokemons
let createFolders = (numDirs, path) => {
    let folders = [];

    for (let i = 0; i < numDirs; i++) {
        folders.push(i + 1);
    }

    return Promise.all(
        folders.map(item => {
            return createFolder(
                pth.join(path, numberPath(item))
            );
        })
    );
};

let createFolder = path => {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, err => {
            err ? reject(err) : resolve(path);
        });
    });
};

// hide pokemons in dirs from list
let hidePokemons = (numDirs, maxHidden, pokemonList, paths) => {
    let hiddenNumber = pokemonList.length < maxHidden ? pokemonList.length : maxHidden;
    let hiddenPokemons = selectRandomPokemons(pokemonList, hiddenNumber);
    let hiddenFolders = random.array(0, numDirs - 1, hiddenNumber);

    return Promise.all(
        hiddenFolders.map(item => {
            return hidePokemon(
                paths[item],
                hiddenPokemons.shift()
            );
        })
    );
};

let hidePokemon = (path, hiddenPokemon) => {    
    return new Promise((resolve, reject) => {    
        fs.writeFile(path + '/pokemon.txt', hiddenPokemon, (err) => {
            err ? reject(err) : resolve(hiddenPokemon);
        });
    });
};

// search pokemons in "path"
let findPokemons = path => {
    return new Promise((resolve, reject) => {
        fs.readFile(path + '/pokemon.txt', { encoding: 'utf8' }, (err, data) => {
            if (err && err.code !== 'ENOENT') {
                reject(err);
            } else {
                if (data) {
                    data = data.split('|');

                    resolve(
                        new Pokemon(data[0], +data[1])
                    );
                } else {
                    resolve(null);
                }
            }
        });
    });
};

// create pokemon list from array
let getPokemonList = list => Promise.resolve(new PokemonList(...list));

let getFindPokemons = list => list.filter(item => item !== null);


module.exports = {
    hide: (path, pokemonList) => { 
        let maxHidden = 3;
        let numDirs = 10;

        return new Promise((resolve, reject) => {
            rmDirRecursive(path, err => {
                err ? reject(err) : resolve(path);
            });
        })
        .then(
            result => createFolder(result)
        )
        .then(
            result => createFolders(numDirs, result)
        )
        .then(
            result => hidePokemons(numDirs, maxHidden, pokemonList, result)
        )
        .then(
            result => getPokemonList(result)
        );
    },

    seek: path => {
        return new Promise((resolve, reject) => {
            fs.readdir(path, (err, files) => {
                err ? reject(err) : resolve(files);
            });
        })
        .then(
            // iterate through the folders and look for pokemons
            result => {
                return Promise.all(
                    result.map(
                        item => findPokemons(pth.join(path, item))
                    )
                )
            }
        )
        .then(
            result => {
                let pokemons = getFindPokemons(result);

                return getPokemonList(pokemons);
            }
        );
    }
}
