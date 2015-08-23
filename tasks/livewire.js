var _ = require('lodash'),
    fs = require('fs'),
    util = require('util');



module.exports = function(grunt) {
  grunt.registerMultiTask('livewire', function() {

    var _this = this;

    var srcBeginRE = new RegExp("<!-- ?livewire:" + this.target + " ?-->");
    var templateParamRE = /\{\{ ?([^\}]*) ?\}\}/g;
    var defaultTemplates = {
      js: '<script src="{{filePath}}"></script>',
      css: '<link rel="stylesheet" href="{{filePath}}" />'
    }

    var options = _.merge({
      srcBegin: srcBeginRE,
      srcEnd: /<!-- ?endlivewire ?-->/,
      template: ':js',
      encoding: 'utf-8',
      preserveIndentation: true
    }, this.options());

    if (options.template[0] === ':') {
      var newTemplate = defaultTemplates[options.template.slice(1)];
      if (newTemplate) { options.template = newTemplate }
    }    

    var stripPath = function(base, path) {
      var re = _.isRegExp(path) ? path : new RegExp(_.escapeRegExp(path))
      return base.replace(re, '');
    }

    var process = function(fileObj) {

      var templates = []

      fileObj.src.forEach(function (file) {
        var fn = options.rename ? options.rename(file) : file;
        fn = options.ignorePath ? stripPath(fn, options.ignorePath) : fn;
        templates.push(processTemplate(templateParamRE, options.template, {filePath: fn, originalPath: file}));
      })
      wire(fileObj.dest, templates, options.srcBegin, options.srcEnd, options.preserveIndentation, options.encoding);
    }

    this.files.forEach(function (fileObj) {
      process(fileObj);
    })

  });
}

function wire(filename, templates, beginRE, endRE, preserveIndentation, encoding) {  
  var orig = fs.readFileSync(filename, encoding)
  var altered = "";
  var beginIndices = beginRE.exec(orig)
  if (beginIndices === null) {
    grunt.log.error("Couldn't find livewire source begin directive: " + beginRE);
    return false;
  }

  var firstPos = beginIndices.index;  

  var indentation = 0;
  if (preserveIndentation) {
    // find difference between current position and start of line,
    // this will be the indentation      
    var c = orig[firstPos]
    while (c != "\n") {
      indentation++;
      c = orig[firstPos - indentation]
    }    
    // end of last line -1
    indentation--;  

    // find the end of the line, this will be the index to slice from
    c = orig[firstPos]
    while (c != "\n") {
      firstPos++
      c = orig[firstPos]
    }
  } else {
    // if we don't care about indentation, then slice from the end of the match
    firstPos += beginIndices[0].length
  }

  var lastPos = orig.slice(firstPos).search(endRE) + firstPos;  

  if (lastPos < 0) {
    grunt.log.error("Couldn't find livewire source end directive: " + endRE);
    return false;
  }

  // if we're preserving indentation, then we just slice from the start of the line
  if (preserveIndentation) {
    var c = orig[lastPos]
    while (c != "\n" && lastPos > 0) {
      lastPos--;
      c = orig[lastPos];
    }
    lastPos++;
  }

  var templateString = _.map(templates, function(t) {
    return _.repeat(' ', indentation) + t;
  }).join("\n")

  var output = orig.slice(0, firstPos) + "\n" + templateString + "\n" + orig.slice(lastPos);
  fs.writeFileSync(filename, output, {encoding: encoding});

}

function processTemplate(re, orig, data) {
  return orig.replace(re, function(_, param) {
    return data[param];
  })
}   