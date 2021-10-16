const { exit } = require('process');
const { readdir, copyFile, mkdir } = require('fs/promises');
const { readFile, opendir, rm } = require('fs');
const mm = require("music-metadata");

// prepare readline
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// promise functions

// clear console
console.clear();

// welcome the user
console.log('Welcome, Undo Audiomack');
console.log('A CLI tool to convert all downloaded audiomack songs to valid mp3 songs.')
console.log('\n');

// guide the user
console.log('Note: All downloaded files from audiomack should be in the \'from\' folder.')
readline.question('Have you done that? (Y/N): ', async (answer) => {

  // exit app is user don't comply
  if (answer.toLowerCase() !== 'y') exit();

  try {
    const fromPath = __dirname + '/from/';
    let toPath = __dirname + '/to/';
    const files = await readdir(fromPath);

    let doesToPathExist = new Promise((res, rej) => {
      opendir(toPath, (err, dir) => {
        if (err) rej(err);
        res(dir);
      });
    })

    // find out if the /to dir exists
    await doesToPathExist
      .then(async dir => {
        if (dir) {
          dir.close();

          let getNewDestDir = new Promise((res, rej) => {
            readline.question("The '/to' directory exist already.\nEnter a new destination directory: ", async (newDestDir) => {
              if (newDestDir === "") rej(new Error("Directory name cannot be empty!"))

              toPath = __dirname + `/${newDestDir}/`;

              res(true);
            })
          });

          // get the new dest dir
          await getNewDestDir
            .catch(err => {
              throw err;
            })
        }
      })
      .catch(err => {
        // throw a blind eye
        // I was expecting you dumb mf!
      })

    console.log('\nCreating destination dir...');

    let checkOrCreate = (path) => new Promise((res, rej) => {
      path = toPath + path.replace(/\//g, "_");
      mkdir(path).then(_ => res(path + '/')).catch(err => res(path + '/'))
    });

    let count = 0;
    let unknown = 0;

    // create destination dir
    await mkdir(toPath)
      .then(async _ => {

        console.log('Converting files to valid mp3 files...');

        // loop through files
        for (const file of files) {
          // copy files to destination
          await copyFile(fromPath + file, toPath + file + '.mp3');

          // create final destination folder and move file
          await mm.parseFile(toPath + file + '.mp3')
            .then(async metadata => {

              // read metadata
              let title = metadata.common.title ?? 'unknown-' + file;
              let artist = metadata.common.artist ?? metadata.common.originalartist;
              let album = metadata.common.album ?? metadata.common.originalalbum;

              if (album !== undefined) {
                await checkOrCreate(album)
                  .then(async newDest => {
                    await copyFile(toPath + file + '.mp3', newDest + title + '.mp3');
                  })
                  .catch(err => { throw err; })
              } else {
                if (artist != undefined) {
                  await checkOrCreate(artist)
                    .then(async newDest => {
                      await copyFile(toPath + file + '.mp3', newDest + title + '.mp3');
                    })
                    .catch(err => { throw err; })
                } else {
                  await checkOrCreate('Unknown')
                    .then(async newDest => {
                      await copyFile(toPath + file + '.mp3', newDest + title + '.mp3');
                      unknown++;
                    })
                    .catch(err => { throw err; })
                }
              }

              // remove old file
              rm(toPath + file + '.mp3', () => { });
            })
            .catch(err => {
              throw err;
            })

          count++;
        }

      })
      .catch(err => {
        throw err;
      });

    // report
    console.log(`\nSuccess. Converted ${count} files to valid mp3 files. 🎉`);
    console.log(`${unknown} of them were unknown. 😕`);
    console.log(`You can find them here: ${toPath}`);

    // say thanks
    console.log('\nThanks. Undo Audiomack.')
    console.log('Please star the repo if it served your purpose @ https://github.com/ebukaodini/undo-audiomack');
    exit();

  } catch (err) {
    console.error(err.message);
    exit();
  }

})
