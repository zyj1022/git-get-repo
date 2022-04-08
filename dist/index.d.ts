declare const downloadUrl: any;
declare const gitClone: any;
declare const rm: any;
/**
 * Download `repo` to `dest` and callback `fn(err)`.
 *
 * @param {String} repo
 * @param {String} dest
 * @param {Object} opts
 * @param {Function} fn
 */
declare function download(repo: any, dest: string, opts: any, fn: Function): void;
/**
 * Normalize a repo string.
 *
 * @param {String} repo
 * @return {Object}
 */
declare function normalize(repo: string): {
    type: string;
    url: any;
    checkout: any;
    origin?: undefined;
    owner?: undefined;
    name?: undefined;
} | {
    type: string;
    origin: any;
    owner: string;
    name: string;
    checkout: string;
    url?: undefined;
};
declare function getType(repo: string): string;
/**
 * Adds protocol to url in none specified
 *
 * @param {String} url
 * @return {String}
 */
declare function addProtocol(origin: string, clone: boolean): string;
/**
 * Return a zip or git url for a given `repo`.
 *
 * @param {Object} repo
 * @return {String}
 */
declare function getURL(repo: any, clone: boolean): string;
