var hb = require('handlebars')
  , fs = require('fs')
  , path = require('path')
  , marked = require('marked')
  , _ = require('underscore')
  , exclude = ['.DS_Store']
  , mkdirp = require('mkdirp')


// insired by: http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
var walk = function(dir) {
  var results = []
  var list = fs.readdirSync(dir)
  list.forEach(function(file) {
    file = dir + '/' + file
    var stat = fs.statSync(file)
    if (stat && stat.isDirectory()) results = results.concat(walk(file))
    else results.push(file)
  })
  return results
}


hb.registerHelper('layout', function(options) {
  return fs.readFileSync('./templates/layout.hb')
    .toString().replace('{{yield}}', options.fn(this))
})

hb.registerHelper('markdown', function(file){
  return new hb.SafeString(marked(fs.readFileSync('./pages/' + file).toString()))
})

var pages = walk('./pages')


_.each(pages, function(filename) {
  if(_.contains(exclude, filename)) return
  var post = fs.readFileSync(filename).toString()
  if(filename.match(/md$/)) {
    filename = filename.replace(/md$/,'html')
    post = '{{#layout}} ' + marked(post) + ' {{/layout}}'
  }else if(filename.match(/html$/)) {
    // noop
  }else throw new Error("Unknown file extension for filename: " + filename)
  var template = hb.compile(post)
  filename = filename.replace(/^.\/pages/,'./public')
  mkdirp.sync(path.dirname(filename))
  console.log("filename", filename)
  fs.writeFileSync(filename, template({}))
})