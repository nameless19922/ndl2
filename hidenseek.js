const 
    PokemonList = require('./pokemonlist'),
    Pokemon     = require('./pokemon'),
    random      = require('./random'),
      
    pth         = require('path'),
    fs          = require('fs');

let numberPath = number => number !== 10 ? '0' + number : number + '',

    hidePokemons = (path, opts) => {    
        let number = numberPath(opts.numberFolder),
            fullPath = pth.join(path + number);

        return new Promise((resolve, reject) => {
            fs.mkdir(fullPath, (err, folder) => {
                if (err) {
                    reject(err);
                } else {
                    if (opts.hiddenFolders.includes(opts.numberFolder)) {
                        let hidden = opts.hiddenPokemons.splice(0, 1)[0];

                        fs.writeFile(fullPath + '/pokemon.txt', hidden, (err) => {
                            err ? reject(err) : resolve(hidden);
                        });
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    },

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
    };

module.exports = {
    hide: (path, pokemonList) => {
        const 
            max = 3,
            numberDirs = 10;

        let length = pokemonList.length,
            hiddenNumber = length < max ? length : max,

            // choose three random pokemons
            hiddenPokemons = [...new Array(hiddenNumber)].map(() => {
                return pokemonList.splice(
                    random.integer(
                        0,
                        pokemonList.length - 1
                    ),
                    1
                )[0];
            }),
            // choose three random folders
            hiddenFolders = random.array(1, numberDirs, hiddenNumber);

        rmDirRecursive(path);

        new Promise((resolve, reject) => {
            fs.mkdir(path, (err, folder) => {
                err ? reject(err) : resolve(folder);
            });
        })
        .then(
            result => {
                // сreate folders and hide pokemons
                return Promise.all(
                    [...new Array(numberDirs).keys()].map(item => {
                        return hidePokemons(
                            path,
                            {
                                hiddenPokemons,
                                hiddenFolders,
                                numberFolder: (item + 1)
                            }
                        );
                    })
                )
            }
        )
        .then(
            result => {
                console.log('Hidden pokemons');

                new PokemonList(
                    ...result.filter(
                        item => item !== null
                    )
                ).show();
            }
        )
        .catch(
            error => console.error(`EXCEPTION\n${error}`)
        )
    },

    seek: (path) => {
        new Promise((resolve, reject) => {
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

                new PokemonList(
                    ...result.filter(
                        item => item !== null
                    )
                ).show();
            }
        )
        .catch(
            error => console.error(`EXCEPTION\n${error.message}`)
        )
    }
}
