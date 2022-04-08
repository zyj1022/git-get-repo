const downloadUrl = require('download');
const gitClone = require('git-clone');
const rm = require('rimraf').sync;

/**
 * Download `repo` to `dest` and callback `fn(err)`.
 *
 * @param {String} repo
 * @param {String} dest
 * @param {Object} opts
 * @param {Function} fn
 */

function download(repo: any, dest: string, opts: any, fn: Function) {
  if (typeof opts === 'function') {
    fn = opts;
    opts = null;
  }
  opts = opts || {};
  const clone = opts.clone || false;
  delete opts.clone;

  repo = normalize(repo);
  const url = repo.url || getURL(repo, clone);

  if (clone) {
    const cloneOptions = {
      checkout: repo.checkout,
      shallow: repo.checkout === 'master',
      ...opts,
    };
    gitClone(url, dest, cloneOptions, (err) => {
      if (err === undefined) {
        rm(dest + '/.git');
        fn();
      } else {
        fn(err);
      }
    });
  } else {
    const downloadOptions = {
      extract: true,
      strip: 1,
      mode: '666',
      ...opts,
      headers: {
        accept: 'application/zip',
        ...(opts.headers || {}),
      },
    };
    downloadUrl(url, dest, downloadOptions)
      .then(() => {
        fn();
      })
      .catch((err) => {
        fn(err);
      });
  }
}

/**
 * Normalize a repo string.
 *
 * @param {String} repo
 * @return {Object}
 */

function normalize(repo: string) {
  let regex: any = /^(?:(direct):([^#]+)(?:#(.+))?)$/;
  let match: any[] = regex.exec(repo);
  if (match) {
    const url = match[2];
    const directCheckout = match[3] || 'master';
    return {
      type: 'direct',
      url: url,
      checkout: directCheckout,
    };
  } else {
    regex =
      /^(?:(github|gitlab|bitbucket|gitee):)?(?:(.+):)?([^/]+)\/([^#]+)(?:#(.+))?$/;
    match = regex.exec(repo);

    const type: string = match[1] || getType(repo);
    let origin: any = match[2] || null;
    const owner: string = match[3];
    const name: string = match[4];
    const checkout: string = match[5] || 'master';

    const ori = {
      github: 'github.com',
      gitlab: 'gitlab.com',
      bitbucket: 'bitbucket.org',
      gitee: 'gitee.com',
    };

    origin = origin == null ? ori[type] : origin;

    return {
      type: type,
      origin: origin,
      owner: owner,
      name: name,
      checkout: checkout,
    };
  }
}

function getType(repo: string) {
  const gits = ['github', 'gitlab', 'bitbucket', 'gitee'];
  let type = gits[0];
  gits.forEach((v) => {
    if (repo.includes(v)) {
      type = v;
    }
  });
  return type;
}

/**
 * Adds protocol to url in none specified
 *
 * @param {String} url
 * @return {String}
 */

function addProtocol(origin: string, clone: boolean): string {
  if (!/^(f|ht)tps?:\/\//i.test(origin)) {
    origin = clone ? `git@${origin}` : `https://${origin}`;
  }

  return origin;
}

/**
 * Return a zip or git url for a given `repo`.
 *
 * @param {Object} repo
 * @return {String}
 */

function getURL(repo: any, clone: boolean): string {
  // Get origin with protocol and add trailing slash or colon (for ssh)
  let origin = addProtocol(repo.origin, clone);
  origin = /^git@/i.test(origin) ? `${origin}:` : `${origin}/`;

  const href = `${origin}${repo.owner}/${repo.name}`;
  const uri: any = {
    github: `${href}/archive/${repo.checkout}.zip`,
    gitlab: `${href}/repository/archive.zip?ref=${repo.checkout}`,
    bitbucket: `${href}/get/${repo.checkout}.zip`,
    gitee: `${href}/repository/archive/${repo.checkout}.zip`,
  };

  const url = clone ? `${href}.git` : uri[repo.type];

  return  url;
}

module.exports = download;
