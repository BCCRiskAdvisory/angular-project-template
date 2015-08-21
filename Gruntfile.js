'use strict';

module.exports = function(grunt) {
  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Automatically load required Grunt tasks
  require('jit-grunt')(grunt, {
    useminPrepare: 'grunt-usemin',
    ngtemplates: 'grunt-angular-templates',
    cdnify: 'grunt-google-cdn'
  });

  var _ = require('lodash')

  grunt.loadTasks('tasks');

  // Application path configuration  
  var appConfig = {
    templateModuleName: 'angularTemplate',
    dirs: {
      src: {
        root: 'client',
        app: 'client/app',
        content: 'client/content',
        style: 'client/content/style',
        images: 'client/content/images',
        fonts: 'client/content/fonts'
      },
      dist: 'dist',
      tmp: {
        root: '.tmp',
        style: '.tmp/style',
        images: '.tmp/images',
        fonts: '.tmp/fonts',
        compiled: '.tmp/compiled',
        sass: '.tmp/sass_cache'
      },
      bower: 'bower_components'
    }
  };

  var sassDirGlobs = [
    appConfig.dirs.src.style + '/**/*.{scss,sass,css}',
    appConfig.dirs.src.app + '/**/*.{scss,sass,css}',
    '!' + appConfig.dirs.src.style + '/**/_*.{scss,sass}',
    '!' + appConfig.dirs.src.app + '/**/_*.{scss,sass}'
  ]

  var concatBanner = function(filepath, baseDir) {
    var relativeName = (_.startsWith(filepath, baseDir)) ? filepath.slice(baseDir.length) : filepath
    if (relativeName[0] == "/") {
      relativeName = relativeName.slice(1)
    }
    return "" +
      "// -----------------------------------\n" +
      "// " + relativeName + "\n" +
      "// -----------------------------------\n\n";
  }


  grunt.initConfig({
    config: appConfig,

    concat: {
      options: {
        process: function(src, filepath) {
          // if the file is in the compiled dir, then it is coffeescript, no need to wrap in IIFE
          if (_.startsWith(filepath, appConfig.dirs.tmp.compiled)) {            
            return concatBanner(filepath, appConfig.dirs.tmp.compiled) + src;
          } else if (_.startsWith(filepath, appConfig.dirs.bower)) {
            return concatBanner(filepath, appConfig.dirs.bower) + src;
          } else {
            return concatBanner(filepath, 'client') + 
              "(function(){\n\n" +
              src +
              "\n\n})();\n";
          }
        }        
      }
    },

    coffee: {
      compile: {
        expand: true,
        cwd: '<%= config.dirs.src.app %>',
        src: ['**/*.js.coffee'],
        dest: '<%= config.dirs.tmp.compiled %>',
        rename: function(dest, src) {
          console.log(dest, src)
          return dest + "/" + src.slice(0, -7)
        }
      }
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['<%= config.dirs.src.app %>/**/*.{js,coffee}'],
        tasks: ['newer:coffee:compile', 'livewire:js']//,
        // options: {
        //   livereload: '<%= connect.options.livereload %>'
        // }
      },
      css: {
        files: sassDirGlobs,
        tasks: ['newer:sass:compile', 'livewire:css']
      },
      jsTest: {
        files: ['<%= config.dirs.src.app %>/**/*.spec.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      // compass: {
      //   files: ['<%= config.dirs.src.style %>/{,*/}*.{scss,sass}'],
      //   tasks: ['compass:server', 'autoprefixer:server']
      // },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= config.dirs.src.content %>/{,*/}*.html',
          '<%= config.dirs.src.images %>/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),              
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.dirs.src.app),
              connect.static(appConfig.dirs.src.content),
              connect.static(appConfig.dirs.tmp.compiled)
            ];
          }
        }
      },
      test: {
        options: {
          port: 9001,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),             
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.dirs.src.app),
              connect.static(appConfig.dirs.tmp.compiled)
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= config.dirs.dist %>'
        }
      }
    },

    // validates source files according to style rules in jshintrc file
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= config.dirs.src.app %>/**/*.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['<%= config.dirs.src.app %>/**/*.spec.js']
      }
    },

    // clean up temporary files
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= config.dirs.dist %>/{,*/}*',
            '!<%= config.dirs.dist %>/.git{,*/}*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      server: {
        options: {
          map: true,
        },
        files: [{
          expand: true,
          cwd: '<%= config.dirs.tmp.style %>',
          src: '{,*/}*.css',
          dest: '<%= config.dirs.tmp.style %>'
        }]
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.dirs.tmp.style %>',
          src: '{,*/}*.css',
          dest: '<%= config.dirs.tmp.style %>'
        }]
      }
    },

    livewire: {
      css: {
        src: sassDirGlobs,
        dest: '<%= config.dirs.src.content %>/index.html',
        options: {
          template: ':css',
          rename: function(origFilename) {
            console.log("renaming: " + origFilename);
            var ext = ".scss";
            if (_.endsWith(origFilename, ext)) {
              return origFilename.slice(0, -ext.length) + ".css";
            } else {
              return origFilename;
            }
          },
          ignorePath: new RegExp('^(' + appConfig.dirs.src.app + "|" + appConfig.dirs.src.style + ')/')
        }
      },
      js: {
        src: [
          '<%= config.dirs.src.app %>/**/*.module.{js,js.coffee}', 
          '<%= config.dirs.src.app %>/**/*.{js,js.coffee}',          
          '!<%= config.dirs.src.app %>/**/*.spec.{js,js.coffee}'
        ],
        dest: '<%= config.dirs.src.content %>/index.html',
        options: {          
          ignorePath: new RegExp('^' + appConfig.dirs.src.app + '/'),
          rename: function(origFilename) {
            var ext = ".js.coffee";
            if (_.endsWith(origFilename, ext)) {
              return origFilename.slice(0, -ext.length) + ".js";
            } else {
              return origFilename;
            }
          }         
        }
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      app: {
        src: ['<%= config.dirs.src.content %>/index.html'],        
        ignorePath:  /\.\.\/\.\.\//
      },
      test: {
        devDependencies: true,
        src: '<%= karma.unit.configFile %>',
        ignorePath:  /\.\.\/\.\.\//,        
        fileTypes:{
          js: {
            block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
            detect: {
              js: /'(.*\.js)'/gi
            },
            replace: {
              js: '\'{{filePath}}\','
            }
          }
        }
      },
      sass: {
        src: ['<%= config.dirs.src.style %>/{,*/}*.{scss,sass}'],
        ignorePath: /(\.\.\/){1,2}bower_components\//
      }
    },

    sass: {
      options: {
        loadPath: ['bower_components', '<%= config.dirs.src.style %>', '<%= config.dirs.src.app %>'],
        cacheLocation: '<%= config.dirs.tmp.sass %>'
      },
      compile: {
        files: [{
          expand: true,
          src: sassDirGlobs,
          dest: '<%= config.dirs.tmp.compiled %>',
          ext: '.css',
          rename: function(dest, src) {
            var altered = src;
            _.each([appConfig.dirs.src.app, appConfig.dirs.src.style], function(dirName) {
              if (_.startsWith(src, dirName)) {
                altered = src.slice(dirName.length);
                return;
              }
            });
            return dest + "/" + altered;            
          }
        }]
      }
    },

    // Compiles Sass to CSS and generates necessary files if requested
    // compass: {
    //   options: {
    //     //sassDir: '.',
    //     specify: [
    //       '<%= config.dirs.src.style %>/**/*.{scss,sass}',
    //       '<%= config.dirs.src.app %>/**/*.{scss,sass}'
    //     ],
    //     cssDir: '<%= config.dirs.tmp.style %>',
    //     generatedImagesDir: '<%= config.dirs.tmp.images %>/generated',
    //     imagesDir: '<%= config.dirs.src.images %>',
    //     javascriptsDir: '<%= config.dirs.src.app %>',
    //     fontsDir: '<%= config.dirs.src.fonts %>',
    //     importPath: './bower_components',
    //     httpImagesPath: '/images',
    //     httpGeneratedImagesPath: '/images/generated',
    //     httpFontsPath: '/fonts',
    //     relativeAssets: false,
    //     assetCacheBuster: false,
    //     raw: 'Sass::Script::Number.precision = 10\n'
    //   },
    //   dist: {
    //     options: {
    //       generatedImagesDir: '<%= config.dirs.dist %>/images/generated'
    //     }
    //   },
    //   server: {
    //     options: {
    //       sourcemap: true
    //     }
    //   }
    // },

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%= config.dirs.dist %>/*.js',
          '<%= config.dirs.dist %>/*.css',
          '<%= config.dirs.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= config.dirs.dist %>/styles/fonts/*'
        ]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= config.dirs.src.content %>/index.html',
      options: {
        dest: '<%= config.dirs.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      html: ['<%= config.dirs.dist %>/{,*/}*.html'],
      css: ['<%= config.dirs.dist %>/styles/{,*/}*.css'],
      js: ['<%= config.dirs.dist %>/*.js'],
      options: {
        assetsDirs: [
          '<%= config.dirs.dist %>',
          '<%= config.dirs.dist %>/images',
          '<%= config.dirs.dist %>/styles'
        ],
        patterns: {
          js: [[/(images\/[^''""]*\.(png|jpg|jpeg|gif|webp|svg))/g, 'Replacing references to images']]
        }
      }
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.dirs.src.images %>',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= config.dirs.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.dirs.src.images %>',
          src: '{,*/}*.svg',
          dest: '<%= config.dirs.dist %>/images'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true
        },
        files: [{
          expand: true,
          cwd: '<%= config.dirs.dist %>',
          src: ['*.html'],
          dest: '<%= config.dirs.dist %>'
        }]
      }
    },

    ngtemplates: {
      dist: {
        options: {
          module: '<%= config.templateModuleName %>',
          htmlmin: '<%= htmlmin.dist.options %>',
          usemin: 'app.js'
        },
        cwd: '<%= config.dirs.src.app %>',
        src: '**/*.html',
        dest: '.tmp/templateCache.js'
      }
    },

    // ng-annotate tries to make the code safe for minification automatically
    // by using the Angular long form for dependency injection.
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.dirs.src.content %>',
          dest: '<%= config.dirs.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            'images/{,*/}*.{webp}',
            'fonts/{,*/}*.*'
          ]
        }, {
          expand: true,
          cwd: '<%= config.dirs.tmp.images %>',
          dest: '<%= config.dirs.dist %>/images',
          src: ['generated/*']
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= config.dirs.src.style %>',
        dest: '<%= config.dirs.tmp.style %>',
        src: '{,*/}*.css'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'compass:server'
      ],
      test: [
        'compass'
      ],
      dist: [
        'imagemin',
        'svgmin'
      ]
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    }

  });

  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'wiredep',
      'coffee:compile',
      'concurrent:server',
      'autoprefixer:server',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'wiredep',
    'coffee:compile',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'wiredep',
    'livewire:js',
    'livewire:css',
    'sass:compile',
    'coffee:compile',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'ngtemplates',
    'concat',
    'ngAnnotate',
    'copy:dist',
    //'cdnify',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin'
  ]);

  grunt.registerTask('default', [
    //'newer:jshint',
    'test',
    'build'
  ]);

};