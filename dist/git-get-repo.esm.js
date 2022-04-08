function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var downloadUrl = /*#__PURE__*/require('download');

var gitClone = /*#__PURE__*/require('git-clone');

var rm = /*#__PURE__*/require('rimraf').sync;
/**
 * Download `repo` to `dest` and callback `fn(err)`.
 *
 * @param {String} repo
 * @param {String} dest
 * @param {Object} opts
 * @param {Function} fn
 */


function download(repo, dest, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts;
    opts = null;
  }

  opts = opts || {};
  var clone = opts.clone || false;
  delete opts.clone;
  repo = normalize(repo);
  var url = repo.url || getURL(repo, clone);

  if (clone) {
    var cloneOptions = _extends({
      checkout: repo.checkout,
      shallow: repo.checkout === 'master'
    }, opts);

    gitClone(url, dest, cloneOptions, function (err) {
      if (err === undefined) {
        rm(dest + '/.git');
        fn();
      } else {
        fn(err);
      }
    });
  } else {
    var downloadOptions = _extends({
      extract: true,
      strip: 1,
      mode: '666'
    }, opts, {
      headers: _extends({
        accept: 'application/zip'
      }, opts.headers || {})
    });

    downloadUrl(url, dest, downloadOptions).then(function () {
      fn();
    })["catch"](function (err) {
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


function normalize(repo) {
  var regex = /^(?:(direct):([^#]+)(?:#(.+))?)$/;
  var match = regex.exec(repo);

  if (match) {
    var url = match[2];
    var directCheckout = match[3] || 'master';
    return {
      type: 'direct',
      url: url,
      checkout: directCheckout
    };
  } else {
    regex = /^(?:(github|gitlab|bitbucket|gitee):)?(?:(.+):)?([^/]+)\/([^#]+)(?:#(.+))?$/;
    match = regex.exec(repo);
    var type = match[1] || getType(repo);
    var origin = match[2] || null;
    var owner = match[3];
    var name = match[4];
    var checkout = match[5] || 'master';
    var ori = {
      github: 'github.com',
      gitlab: 'gitlab.com',
      bitbucket: 'bitbucket.org',
      gitee: 'gitee.com'
    };
    origin = origin == null ? ori[type] : origin;
    return {
      type: type,
      origin: origin,
      owner: owner,
      name: name,
      checkout: checkout
    };
  }
}

function getType(repo) {
  var gits = ['github', 'gitlab', 'bitbucket', 'gitee'];
  var type = gits[0];
  gits.forEach(function (v) {
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


function addProtocol(origin, clone) {
  if (!/^(f|ht)tps?:\/\//i.test(origin)) {
    origin = clone ? "git@" + origin : "https://" + origin;
  }

  return origin;
}
/**
 * Return a zip or git url for a given `repo`.
 *
 * @param {Object} repo
 * @return {String}
 */


function getURL(repo, clone) {
  // Get origin with protocol and add trailing slash or colon (for ssh)
  var origin = addProtocol(repo.origin, clone);
  origin = /^git@/i.test(origin) ? origin + ":" : origin + "/";
  var href = "" + origin + repo.owner + "/" + repo.name;
  var uri = {
    github: href + "/archive/" + repo.checkout + ".zip",
    gitlab: href + "/repository/archive.zip?ref=" + repo.checkout,
    bitbucket: href + "/get/" + repo.checkout + ".zip",
    gitee: href + "/repository/archive/" + repo.checkout + ".zip"
  };
  var url = clone ? href + ".git" : uri[repo.type];
  return url;
}

module.exports = download;
//# sourceMappingURL=git-get-repo.esm.js.map
