var gulp = require("gulp"),
    path = require("path"),
    fs = require("fs"),
    log = require("fancy-log"),
    concat = require("gulp-concat"),
    closure_compiler = require("gulp-closure-compiler"),
    change = require("gulp-change"),
    rename = require("gulp-rename"),
    clean = require("gulp-clean"),
    deploy = require('gulp-gh-pages');

var bases = {
    mxgraph: 'mxgraph2/javascript/src',
    drawio: 'drawio/war',
    dist: 'dist'
};

var sources = {
    client : ["drawio/war/js/deflate/base64.js", "drawio/war/js/diagramly/Init.js",
              "drawio/war/js/mxgraph/Init.js", path.join(bases.dist, "mxClient.js"),
              "drawio/war/js/jscolor/jscolor.js"],
    stylesheet : "drawio/war/styles/default.xml",
    grapheditor: ["drawio/war/js/mxgraph/Editor.js", "drawio/war/js/mxgraph/EditorUi.js",
        "drawio/war/js/mxgraph/Sidebar.js", "drawio/war/js/mxgraph/Graph.js",
        "drawio/war/js/mxgraph/Shapes.js", "drawio/war/js/mxgraph/Actions.js",
        "drawio/war/js/mxgraph/Menus.js", "drawio/war/js/mxgraph/Format.js",
        "drawio/war/js/mxgraph/Toolbar.js", "drawio/war/js/mxgraph/Dialogs.js"],
    sidebar : "drawio/war/js/diagramly/sidebar/Sidebar.js",
    baseapp: ["drawio/war/js/diagramly/DrawioFile.js",
        "drawio/war/js/diagramly/LocalFile.js",
        "drawio/war/js/diagramly/LocalLibrary.js",
        "drawio/war/js/diagramly/StorageFile.js",
        "drawio/war/js/diagramly/StorageLibrary.js",
        "drawio/war/js/diagramly/UrlLibrary.js",
        "drawio/war/js/diagramly/Dialogs.js",
        "drawio/war/js/diagramly/Editor.js",
        "drawio/war/js/diagramly/EditorUi.js",
        "drawio/war/js/diagramly/Settings.js",
        path.join(bases.dist, "Graph-Stylesheet.js"),
        "drawio/war/js/diagramly/util/mxAsyncCanvas.js",
        "drawio/war/js/diagramly/util/mxJsCanvas.js",
        "drawio/war/js/diagramly/DrawioClient.js",
        "drawio/war/js/diagramly/DrawioUser.js",
        "drawio/war/js/diagramly/DriveRealtime.js",
        "drawio/war/js/diagramly/RealtimeMapping.js",
        "drawio/war/js/diagramly/DriveFile.js",
        "drawio/war/js/diagramly/DriveLibrary.js",
        "drawio/war/js/diagramly/DriveClient.js",
        "drawio/war/js/diagramly/DropboxFile.js",
        "drawio/war/js/diagramly/DropboxLibrary.js",
        "drawio/war/js/diagramly/DropboxClient.js",
        "drawio/war/js/diagramly/OneDriveFile.js",
        "drawio/war/js/diagramly/OneDriveLibrary.js",
        "drawio/war/js/diagramly/OneDriveClient.js",
        "drawio/war/js/diagramly/GitHubFile.js",
        "drawio/war/js/diagramly/GitHubLibrary.js",
        "drawio/war/js/diagramly/GitHubClient.js",
        "drawio/war/js/diagramly/TrelloFile.js",
        "drawio/war/js/diagramly/TrelloLibrary.js",
        "drawio/war/js/diagramly/TrelloClient.js",
        "drawio/war/js/diagramly/ChatWindow.js",
        "drawio/war/js/diagramly/App.js",
        "drawio/war/js/diagramly/Menus.js",
        "drawio/war/js/diagramly/Pages.js",
        "drawio/war/js/diagramly/Trees.js" ],
    drawio: [ "drawio/war/js/spin/spin.min.js", "drawio/war/js/sanitizer/sanitizer.min.js",
              "drawio/war/js/deflate/pako.min.js",
              path.join(bases.dist, "client.min.js"),
              path.join(bases.dist, "grapheditor.min.js"),
              path.join(bases.dist, "sidebar.min.js"),
              path.join(bases.dist, "base-app.min.js") ],
    'drawio-tmp': [ path.join(bases.dist,"Graph-Stylesheet.js"),
        path.join(bases.dist, "Graph-Resources.js"),
        path.join(bases.dist, "grapheditor.min.js"),
        path.join(bases.dist, "sidebar.min.js"),
        path.join(bases.dist, "client.min.js"),
        path.join(bases.dist, "diagramly.min.js"),
        path.join(bases.dist, "base-app.min.js"),
        path.join(bases.dist, "base-diagramly.min.js"),
        path.join(bases.dist, "base-vsdx.min.js"),
        path.join(bases.dist, "mxClient.js")
    ]
};

// To get the dependencies for the project, read the file names by matching
// mxClient.include([...]) in mxClient.js. This is not perfect, but the list is
// required in mxClient.js for compatibility.
var mxClientContent = fs.readFileSync(
    path.join(process.cwd(), bases.mxgraph, "js/mxClient.js"),
    "utf8"
);
var deps = mxClientContent.match(/mxClient\.include\([^"']+["'](.*?)["']/gi).map(function (str) {
    return bases.mxgraph + str.match(/mxClient\.include\([^"']+["'](.*?)["']/)[1];
});
deps = [path.join(bases.mxgraph, "js/mxClient.js")].concat(deps.slice(0));

gulp.task('deploy', function() {
    return gulp.src(path.join(bases.dist, '/**/*'))
        .pipe(deploy());
});

gulp.task('clean', function() {
    return gulp.src(bases.dist, {allowEmpty : true})
        .pipe(clean());
});

gulp.task('clean-tmp', function() {
    return gulp.src(sources["drawio-tmp"], { allowEmpty: true })
        .pipe(clean());
});

gulp.task('mxgraph', function() {
    return gulp.src(deps)
        .pipe(concat("mxClient.js"))
        .pipe(gulp.dest(bases.dist))
});

gulp.task('mxgraph-resources', function() {
    return gulp.src(["css/*", "images/*", "resources/*"],
                    { cwd : bases.mxgraph, base : bases.mxgraph})
        .pipe(gulp.dest(path.join(bases.dist, "mxgraph")))
});

gulp.task('drawio-resources', function() {
    return gulp.src(["styles/*", "images/*", "!images/sidebar-*.png", "resources/*", "shortcuts.svg"],
        { cwd : bases.drawio, base : bases.drawio })
        .pipe(gulp.dest(bases.dist))
});

gulp.task('diagrammer-resources', function() {
    return gulp.src(["*.html", "libs/*", "images/*"],
                     { cwd : 'src', base : 'src' })
        .pipe(gulp.dest(bases.dist))
});

gulp.task("graph-stylesheet", function() {
    return gulp.src(sources.stylesheet)
        .pipe(change(function (content, done) {
            content = content.replace(/\n/g,"");
            content = content.replace(/\t/g,"");
            content = content.replace(/'/g,"\\'");
            done(null, "Graph.prototype.defaultThemes[Graph.prototype.defaultThemeName] = mxUtils.parseXml('" +
                    content + "').documentElement;");
        }))
        .pipe(rename("Graph-Stylesheet.js"))
        .pipe(gulp.dest(bases.dist))
});

gulp.task('client', function() {
    return gulp.src(sources.client)
        .pipe(closure_compiler(({
            compilerPath : "drawio/etc/build/compiler.jar",
            fileName : "client.min.js",
            compilerFlags: {
                compilation_level: 'SIMPLE_OPTIMIZATIONS',
                // warning_level: 'VERBOSE'
            }
        })))
        .pipe(gulp.dest(bases.dist))
});

gulp.task('grapheditor', function() {
    return gulp.src(sources.grapheditor)
        .pipe(closure_compiler(({
            compilerPath : "drawio/etc/build/compiler.jar",
            fileName : "grapheditor.min.js",
            continueWithWarnings: true,
            compilerFlags: {
                compilation_level: 'SIMPLE_OPTIMIZATIONS',
                // warning_level: 'VERBOSE'
            }
        })))
        .pipe(gulp.dest(bases.dist))
});

gulp.task('sidebar', function() {
    return gulp.src(sources.sidebar)
        .pipe(closure_compiler(({
            compilerPath : "drawio/etc/build/compiler.jar",
            fileName : "sidebar.min.js",
            compilerFlags: {
                compilation_level: 'SIMPLE_OPTIMIZATIONS',
                // warning_level: 'VERBOSE'
            }
        })))
        .pipe(gulp.dest(bases.dist))
});

gulp.task('base-app', function() {
    return gulp.src(sources.baseapp)
        .pipe(closure_compiler(({
            compilerPath : "drawio/etc/build/compiler.jar",
            fileName : "base-app.min.js",
            continueWithWarnings: true,
            compilerFlags: {
                compilation_level: 'SIMPLE_OPTIMIZATIONS',
                // warning_level: 'VERBOSE'
            }
        })))
        .pipe(gulp.dest(bases.dist))
});


gulp.task("drawio", function() {
    return gulp.src(sources.drawio)
        .pipe(concat("app.min.js"))
        .pipe(gulp.dest(path.join(bases.dist, "js")))
});

gulp.task('default',
    gulp.series('clean',
                'mxgraph',
                'graph-stylesheet',
                gulp.parallel('client', 'grapheditor', 'sidebar', 'base-app'),
                'drawio',
                gulp.parallel('mxgraph-resources', 'drawio-resources', 'diagrammer-resources'),
                'clean-tmp'));