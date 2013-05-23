var cheerio = require('cheerio')
  , toMarkdown = require('to-markdown').toMarkdown
  , fs = require('fs')
  , _ = require('underscore')
  , mkdirp = require('mkdirp')


function pad(num, n){
  if(arguments.length < 2) n = 2;
  var res = ''
  var s = Math.pow(10, n)
  while(s > 1){
    if( num < s ) res += '0'
    else break
    s = s / 10
  }
  return res + String(num);
}


var id = 0
_.each(_.range(1,8), function(i){
  var $ = cheerio = cheerio.load(fs.readFileSync('./priceroads/Price Roads' + i + '.html').toString())
  var titles = _.map($('a[rel="bookmark"]'), function(c){ return $(c) })
  var dates = _.map($('h1'), function(c){ return $(c).next().text().match(/[A-Za-z]+ \d{1,2}, \d{1,4}/)[0] })
  var content = _.map($('.entry-content'), function(c){ return $(c).html() })

  _.each(_.zip(titles, content, dates), function(post){
    var title = post[0]
    var content = post[1].replace(/&nbsp;/g,'')
    var datestr = post[2] ? post[2] : '';
    title.attr('href', title.attr('href').replace('http://priceroads.com/','/'))
    var path = './posts' + title.attr('href')
    title = $('<div></div>').append(title).html()
    mkdirp.sync(path)
    fs.writeFileSync( path + '/index.md'
      , '## ' + toMarkdown(title) + '\n\n'
      + datestr + '\n'
      + toMarkdown(content) )
  })
})