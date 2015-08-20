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
        fonts: '.tmp/fonts'
      }
    }
  };

  grunt.initConfig({
    config: appConfig,

    concat: {
      options: {
        process: function(src, filepath) {
          return "// " + filepath + "\n\n" +
          "(function(){\n\n" +
          src +
          "})();\n\n"
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
        files: ['<%= config.dirs.src.app %>/**/*.js'],
        //tasks: ['newer:jshint:all'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      jsTest: {
        files: ['<%= config.dirs.src.app %>/**/*.spec.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      compass: {
        files: ['<%= config.dirs.src.style %>/{,*/}*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer:server']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= config.dirs.src.content %>/{,*/}*.html',
          '<%= config.dirs.tmp.style %>/{,*/}*.css',
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
              connect.static(appConfig.dirs.src.content)
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
              connect.static(appConfig.dirs.src.app)
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

    // Compiles Sass to CSS and generates necessary files if requested
    compass: {
      options: {
        sassDir: '<%= config.dirs.src.style %>',
        cssDir: '<%= config.dirs.tmp.style %>',
        generatedImagesDir: '<%= config.dirs.tmp.images %>/generated',
        imagesDir: '<%= config.dirs.src.images %>',
        javascriptsDir: '<%= config.dirs.src.app %>',
        fontsDir: '<%= config.dirs.src.fonts %>',
        importPath: './bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/fonts',
        relativeAssets: false,
        assetCacheBuster: false,
        raw: 'Sass::Script::Number.precision = 10\n'
      },
      dist: {
        options: {
          generatedImagesDir: '<%= config.dirs.dist %>/images/generated'
        }
      },
      server: {
        options: {
          sourcemap: true
        }
      }
    },

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%= config.dirs.dist %>/scripts/{,*/}*.js',
          '<%= config.dirs.dist %>/styles/{,*/}*.css',
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
        'compass:dist',
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
      'concurrent:server',
      'autoprefixer:server',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'wiredep',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'wiredep',
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