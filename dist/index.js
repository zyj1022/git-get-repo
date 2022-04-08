
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./git-get-repo.cjs.production.min.js')
} else {
  module.exports = require('./git-get-repo.cjs.development.js')
}
