const fs = require('fs');

const FormData = require('form-data');

const Service = require('./service');

const { Config } = require('../../../../config');

const { IS_PROD } = Config.APPLICATION;

const { to, TE } = require('../../../helper');

let results = { errLog: [], ok: 0 };

const createFlow = async (results, dirPath, fileName, auth) => {

  const file = fs.createReadStream(`${dirPath}/${fileName}`);

  const form = new FormData();
  form.append('deployment-name', fileName.split('.')[0]);
  // form.append('tenant-id', 'LI');
  form.append('deployment-source', 'LIW');
  form.append('file', file, fileName);

  const [err, result] = await to(Service.create(form, auth));

  if (err) results.errLog.push(err);

  if (!result) results.errLog.push('Result not found');

  if (result) results.ok++;
};

const create = async (dirPath, pathList, auth) => {

  if (!dirPath) dirPath = `${__dirname}/../../flows`;

  for (let i = 0; i < pathList.length; i++) {

    const { filePath, fileName } = pathList[i];

    results = { errLog: [], ok: 0 };

    if (filePath) {

      const subDirPath = `${dirPath}/${filePath}`;

      if (!IS_PROD && filePath === 'schedulers') {
        TE('Only permission to production');
      }

      await createFlow(results, subDirPath, fileName, auth);

      return results;
    }

    await createFlow(results, dirPath, fileName, auth);
    
  }

  return results;
};

const createList = async (dirPath, auth) => {

  if (!dirPath) dirPath = `${__dirname}/../../flows`;

  const files = fs.readdirSync(dirPath);

  results = { errLog: [], ok: 0 };

  for (let i = 0; i < files.length; i++) {

    const fileName = files[i];

    const subDirPath = `${dirPath}/${fileName}`;

    const isDirectory = fs.lstatSync(subDirPath).isDirectory();

    if (isDirectory) {

      const subFiles = fs.readdirSync(subDirPath);

      // if (IS_PROD && fileName === 'simulations') continue;

      if (!IS_PROD && fileName === 'schedulers') continue;

      for (let i = 0; i < subFiles.length; i++) {

        const subFile = subFiles[i];

        await createFlow(results, subDirPath, subFile, auth);
      }

      continue;
    }

    await createFlow(results, dirPath, fileName, auth);
  }

  return results;
};

module.exports = {

  create: create,

  createList: createList,
};