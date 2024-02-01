const Service = require('./service');

// const { Config } = require('../../../../config');

const { to, TE } = require('../../../helper');

const { Promise } = require('mongoose');

const _deleteList = async (results, flowList, auth) => {

  if (!flowList) return;

  const promises = [];

  flowList.map((dep) => {

    if (dep && dep.id) {

      promises.push(
        Promise.resolve('')
          .then(async () => {

            const [err, result] = await to(Service.del(dep.id, { cascade: true }, auth));

            if (err) {
              return { error: err, };
            }

            return { success: result, };
          })
      );
    }

  });

  const [err, finalRes] = await to(Promise.all(promises));

  if (err) {
    TE({
      code: 403,
      data: err,
      success: false
    });
  }

  // let successCount = 0;

  finalRes.map((data) => {
    if (data.success === '') results.ok++;
    if (data.error) results.errLog.push(data.error);
  });
};

const del = async (idList, auth) => {

  if (process.env.NODE_ENV === 'development') {

    const flowList = [];

    const results = { errLog: [], ok: 0 };

    for (let i = 0; i < idList.length; i++) {
      const id = idList[i];

      const [err, flow] = await to(Service.get(id, auth));

      if(err){
        results.errLog.push({error: err});
        continue;
      }
      
      flowList.push(flow);
    }

    await _deleteList(results, flowList, auth);

    return results;
  }

  TE({
    code: 401,
    error: 'Unauthorized request',
    success: false
  });
};

const deleteList = async (auth) => {

  if (process.env.NODE_ENV === 'development') {

    const results = { errLog: [], ok: 0 };

    const flowList = await Service.getList({
      // tenantIdIn: 'LI'
    }, auth);

    if (!flowList) {

      TE({
        code: 403,
        error: 'deployment flows not found',
        success: false
      });
    }

    await _deleteList(results, flowList, auth);

    return results;
  }

  TE({
    code: 401,
    error: 'Unauthorized request',
    success: false
  });
};

module.exports = {

  del: del,

  deleteList: deleteList
};