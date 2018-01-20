var gulp = require("gulp"),
    path = require("path"),
    fs = require("fs"),
    log = require("fancy-log"),
    concat = require("gulp-concat"),
    closure_compiler = require("gulp-closure-compiler"),
    change = require("gulp-change"),
    rename = require("gulp-rename"),
    clean = require("gulp-clean"),
    git = require('git-rev-sync'),
    replace = require('gulp-replace'),
    deploy = require('gulp-gh-pages');

var bases = {
    mxgraph: 'mxgraph2/javascript/src',
    drawio: 'drawio/src/main/webapp',
    dist: 'dist'
};

var sources = {
    client : [
        path.join(bases.drawio, "js/deflate/base64.js"),
        path.join(bases.drawio, "js/diagramly/Init.js"),
        path.join(bases.drawio, "js/mxgraph/Init.js"),
        path.join(bases.dist, "mxClient.js"),
        path.join(bases.drawio, "js/jscolor/jscolor.js")
    ],
    stylesheet : path.join(bases.drawio, "styles/default.xml"),
    grapheditor: [
        path.join(bases.drawio, "js/mxgraph/Editor.js"), path.join(bases.drawio, "js/mxgraph/EditorUi.js"),
        path.join(bases.drawio, "js/mxgraph/Sidebar.js"), path.join(bases.drawio, "js/mxgraph/Graph.js"),
        path.join(bases.drawio, "js/mxgraph/Shapes.js"), path.join(bases.drawio, "js/mxgraph/Actions.js"),
        path.join(bases.drawio, "js/mxgraph/Menus.js"), path.join(bases.drawio, "js/mxgraph/Format.js"),
        path.join(bases.drawio, "js/mxgraph/Toolbar.js"), path.join(bases.drawio, "js/mxgraph/Dialogs.js") ],
    sidebar : path.join(bases.drawio, "js/diagramly/sidebar/Sidebar.js"),
    baseapp: [
        path.join(bases.drawio, "js/diagramly/DrawioFile.js"),
        path.join(bases.drawio, "js/diagramly/LocalFile.js"),
        path.join(bases.drawio, "js/diagramly/LocalLibrary.js"),
        path.join(bases.drawio, "js/diagramly/StorageFile.js"),
        path.join(bases.drawio, "js/diagramly/StorageLibrary.js"),
        path.join(bases.drawio, "js/diagramly/UrlLibrary.js"),
        path.join(bases.drawio, "js/diagramly/Dialogs.js"),
        path.join(bases.drawio, "js/diagramly/Editor.js"),
        path.join(bases.drawio, "js/diagramly/EditorUi.js"),
        path.join(bases.drawio, "js/diagramly/Settings.js"),
        path.join(bases.dist, "Graph-Stylesheet.js"),
        path.join(bases.drawio, "js/diagramly/util/mxAsyncCanvas.js"),
        path.join(bases.drawio, "js/diagramly/util/mxJsCanvas.js"),
        path.join(bases.drawio, "js/diagramly/DrawioClient.js"),
        path.join(bases.drawio, "js/diagramly/DrawioUser.js"),
        path.join(bases.drawio, "js/diagramly/DriveRealtime.js"),
        path.join(bases.drawio, "js/diagramly/RealtimeMapping.js"),
        path.join(bases.drawio, "js/diagramly/DriveFile.js"),
        path.join(bases.drawio, "js/diagramly/DriveLibrary.js"),
        path.join(bases.drawio, "js/diagramly/DriveClient.js"),
        path.join(bases.drawio, "js/diagramly/DropboxFile.js"),
        path.join(bases.drawio, "js/diagramly/DropboxLibrary.js"),
        path.join(bases.drawio, "js/diagramly/DropboxClient.js"),
        path.join(bases.drawio, "js/diagramly/OneDriveFile.js"),
        path.join(bases.drawio, "js/diagramly/OneDriveLibrary.js"),
        path.join(bases.drawio, "js/diagramly/OneDriveClient.js"),
        path.join(bases.drawio, "js/diagramly/GitHubFile.js"),
        path.join(bases.drawio, "js/diagramly/GitHubLibrary.js"),
        path.join(bases.drawio, "js/diagramly/GitHubClient.js"),
        path.join(bases.drawio, "js/diagramly/TrelloFile.js"),
        path.join(bases.drawio, "js/diagramly/TrelloLibrary.js"),
        path.join(bases.drawio, "js/diagramly/TrelloClient.js"),
        path.join(bases.drawio, "js/diagramly/ChatWindow.js"),
        path.join(bases.drawio, "js/diagramly/App.js"),
        path.join(bases.drawio, "js/diagramly/Menus.js"),
        path.join(bases.drawio, "js/diagramly/Pages.js"),
        path.join(bases.drawio, "js/diagramly/Trees.js")
    ],
    drawio: [
        path.join(bases.drawio, "js/spin/spin.min.js"),
        path.join(bases.drawio, "js/sanitizer/sanitizer.min.js"),
        path.join(bases.drawio, "js/deflate/pako.min.js"),
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

var DRAWIO_VERSION =fs.readFileSync(
    path.join(process.cwd(), bases.drawio, "../../../VERSION"),
    "utf8"
);

var gitrev = git.short();
log("Building from git revision " + gitrev);

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

gulp.task('mxgraph-src', function() {
    return gulp.src(deps)
        .pipe(concat("mxClient.js"))
        .pipe(gulp.dest(bases.dist))
});

gulp.task('mxgraph', function() {
    return gulp.src('drawio/etc/mxgraph/mxClient.js')
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
    return gulp.src(["images/*", "templates/**"],
                     { cwd : 'src', base : 'src' })
        .pipe(gulp.dest(bases.dist))
});

gulp.task('diagrammer-app', function() {
    return gulp.src(["*.html", "libs/*"],
        { cwd : 'src', base : 'src' })
        .pipe(replace('@SCDD-REV@', gitrev))
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
            continueWithWarnings: true,
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
        .pipe(replace('@DRAWIO-VERSION@', DRAWIO_VERSION))
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
                gulp.parallel('client', 'grapheditor', 'sidebar', 'base-app', 'diagrammer-app'),
                'drawio',
                gulp.parallel('mxgraph-resources', 'drawio-resources', 'diagrammer-resources'),
                'clean-tmp'));