module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
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
        cwd: 'src/css/',
        src: ['*.css', '!*.min.css'],
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
          dest: '/var/www/jerrysu.me/html/',
          host: 'jerrysu.me'
        }
      }
    },
    watch: {
      css: {
        files: ['src/css/**/*.css'],
        tasks: ['cssmin']
      },
      html: {
        files: ['src/**/*.html'],
        tasks: ['htmlmin']
      } 
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-rsync');

  grunt.registerTask('build', ['copy', 'cssmin', 'htmlmin']);
  grunt.registerTask('dev', ['build', 'connect:server', 'watch']);
  grunt.registerTask('deploy', ['build', 'rsync:prod']);
  grunt.registerTask('default', ['build']);
};
