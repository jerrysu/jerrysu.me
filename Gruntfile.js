module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    autoprefixer: {
      dist: {
        expand: true,
        cwd: 'build/',
        src: ['**/*.css', '!**/*.min.css'],
        dest: 'build/'
      }
    },
    connect: {
      server: {
        options: {
          base: 'build/',
          open: true,
          useAvailablePort: true
        }
      }
    },
    copy: {
      dist: {
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
      dist: {
        expand: true,
        cwd: 'build/css/',
        src: ['**/*.css', '!**/*.min.css'],
        dest: 'build/css/',
        ext: '.css'
      }
    },
    htmlmin: {
      dist: {
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
      css: {
        files: ['src/css/**/*.css'],
        tasks: ['css']
      },
      html: {
        files: ['src/**/*.html'],
        tasks: ['html']
      } 
    }
  });

  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-rsync');

  grunt.registerTask('css', ['autoprefixer', 'cssmin']);
  grunt.registerTask('html', ['htmlmin']);
  grunt.registerTask('build', ['copy', 'css', 'html']);
  grunt.registerTask('dev', ['build', 'connect:server', 'watch']);
  grunt.registerTask('deploy', ['build', 'rsync:prod']);
  grunt.registerTask('default', ['build']);
};
