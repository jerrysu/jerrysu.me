module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    autoprefixer: {
      build: {
        expand: true,
        cwd: 'build/',
        src: ['**/*.css', '!**/*.min.css'],
        dest: 'build/',
        options: {
          cascade: false,
          /*map: true*/
        }
      }
    },
    'cache-busting': {
      css: {
        replace: ['build/**/*.html'],
        replacement: 'style.css',
        file: 'build/css/style.css'
      }
    },
    clean: {
      build: ['build/']
    },
    connect: {
      server: {
        options: {
          base: 'build/',
          open: true,
          useAvailablePort: true,
          livereload: true
        }
      }
    },
    copy: {
      build: {
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: ['**'],
            dest: 'build/'
          }
        ]
      }
    },
    cssmin: {
      build: {
        expand: true,
        cwd: 'build/css/',
        src: ['**/*.css', '!**/*.min.css'],
        dest: 'build/css/',
        ext: '.css'
      }
    },
    htmlmin: {
      build: {
        options: {
          removeComments: true,
          removeCommentsFromCDATA: true,
          removeCDATASectionsFromCDATA: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          removeOptionalTags: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true
        },
        files: {
          "build/index.html": "src/index.html"
        }
      }
    },
    rsync: {
      options: {
        args: ['--verbose'],
        recursive: true
      },
      prod: {
        options: {
          src: 'build/',
          dest: '<%= pkg.deployment.prod.path %>',
          host: '<%= pkg.deployment.prod.host %>'
        }
      }
    },
    watch: {
      src: {
        files: ['src/**/*'],
        tasks: ['build'],
        options: {
          livereload: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-cache-busting');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-rsync');

  grunt.registerTask('css', ['autoprefixer']);
  grunt.registerTask('build', ['copy', 'css']);
  grunt.registerTask('dev', ['build', 'connect:server', 'watch']);
  grunt.registerTask('minify', ['cssmin', 'htmlmin']);
  grunt.registerTask('deploy', ['clean', 'build', 'minify', 'cache-busting', 'rsync:prod']);
  grunt.registerTask('default', ['dev']);
};
