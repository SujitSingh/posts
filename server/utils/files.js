const fs = require('fs');
const path = require('path');
const rootDir = require('./paths');

exports.deleteFile = (filePath) => {
  fs.unlink(path.resolve(rootDir, filePath), error => {
    if (error) {
      console.log('Failed to delete file', error);
    }
  })
}