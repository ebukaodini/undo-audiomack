const { exit } = require('process');
const { readdir, copyFile, mkdir } = require('fs/promises');

// prepare readline
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

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

  console.log('\n')

  try {
    const fromPath = './from/';
    const toPath = './to/';
    const files = await readdir(fromPath);

    console.log('Converting the file to valid mp3 files...');


    // create destination path if it doesn't exist
    await mkdir(toPath)
      .then(async _ => {

        let count = 0;

        // loop through files
        for (const file of files) {

          // copy files to destination
          await copyFile(fromPath + file, toPath + file + '.mp3');

          count++;
        }

        // report
        console.log('\n');
        console.log(`Success. Converted ${count} files to valid mp3 files. 🎉`);
        console.log(`You can find them here: ${toPath}`);

      })
      .catch(err => {
        throw err;
      })

    // say thanks
    console.log('\n');
    console.log('Thanks. Undo Audiomack.')
    console.log('Please star the repo if it served your purpose @ https://github.com/ebukaodini/undo-audiomack');
    exit();

  } catch (err) {
    console.error(err.message);
    exit();
  }

})
