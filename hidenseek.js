const 
    PokemonList = require('./pokemonlist'),
    Pokemon     = require('./pokemon'),
    random      = require('./random'),
      
    pth         = require('path'),
    fs          = require('fs');

let numberPath = number => number !== 10 ? '0' + number : number + '',
   
    // get random pokemons
    selectRandomPokemons = (pokemonList, number) => {
        return [...new Array(number)].map(() => {
            return pokemonList.splice(
                random.integer(0, pokemonList.length - 1), 1
            )[0];
        })
    },
    
    // hide pokemon in file
    hidePokemon = (path, opts) => {    
        let number = numberPath(opts.numberFolder),
            fullPath = pth.join(path, number);
        
        return new Promise((resolve, reject) => {
            fs.mkdir(fullPath, (err, folder) => {
                if (err) {
                    reject(err);
                } else {
                    if (opts.hiddenFolders.includes(opts.numberFolder)) {
                        let hiddenPokemon = opts.hiddenPokemons.splice(0, 1)[0];
                        
                        fs.writeFile(fullPath + '/pokemon.txt', hiddenPokemon, (err) => {
                            err ? reject(err) : resolve(hiddenPokemon);
                        });
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    },

    // сreate folders and hide pokemons
    hidePokemons = (opts, pokemonList, path) => {
        let hiddenNumber = pokemonList.length < opts.maxHidden ? pokemonList.length : opts.maxHidden,
            
            hiddenPokemons = selectRandomPokemons(pokemonList, hiddenNumber),
            hiddenFolders = random.array(1, opts.numDirs, hiddenNumber);
        
        return Promise.all(
            [...new Array(opts.numDirs).keys()].map(item => {
                return hidePokemon(
                    path,
                    {
                        hiddenPokemons,
                        hiddenFolders,
                        numberFolder: (item + 1)
                    }
                );
            })
        )
    },

    // search pokemons in "path"
    findPokemons = path => {
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
    },

    rmDirRecursive = path => {
        if (fs.existsSync(path)) {
            for (file of fs.readdirSync(path)) {
                let curPath = path + "/" + file;

                fs.lstatSync(curPath).isDirectory() ? rmDirRecursive(curPath) : fs.unlinkSync(curPath);
            }

            fs.rmdirSync(path);
        }
    },
    
    filterPokemons = list => new PokemonList(...list.filter(item => item !== null));


module.exports = {
    hide: (path, pokemonList) => {
        rmDirRecursive(path);
        
        let opts = { maxHidden: 3, numDirs: 10 },
            
            hidePromise = new Promise((resolve, reject) => {
                fs.mkdir(path, (err, folder) => {
                    err ? reject(err) : resolve(folder);
                });
            })
            .then(
                result => hidePokemons(opts, pokemonList, path)
            )
            .then(
                result => {
                    console.log('Hidden pokemons');
                    filterPokemons(result).show();
                }
            )
            .catch(
                error => console.error(`EXCEPTION\n${error}`)
            );
    },

    seek: (path) => {
        let seekPromise = new Promise((resolve, reject) => {
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
                console.log('Found pokemons');
                filterPokemons(result).show();
            }
        )
        .catch(
            error => console.error(`EXCEPTION\n${error.message}`)
        )
    }
}
