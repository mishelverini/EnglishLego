const { src, dest, parallel, series, watch } = require('gulp');
const sass = require('gulp-sass');
const notify = require('gulp-notify');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const fileInclude = require('gulp-file-include');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const del = require('del');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const uglify = require('gulp-uglify-es').default;

const htmlConversion = () => {
    return src('./src/index.html')
        .pipe(fileInclude({
            prefix: '@',
            basepath: '@file'
        }))
        .pipe(dest('./build'))
        .pipe(browserSync.stream());
}

const stylesConversion = () => {
    return src('./src/scss/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', notify.onError()))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(cleanCss({
            level: 2
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('./build/style'))
        .pipe(browserSync.stream());
}

const imgConversion = () => {
    return src(['./src/images/**.jpg', './src/images/**.png', './src/images/**.jpeg'])
        .pipe(dest('./build/images'))
}

const createSvgSprites = () => {
    return src('./src/images/**.svg')
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: "../sprite.svg"
                }
            }
        }))
        .pipe(dest('./build/images'))
}

const resourcesConversion = () => {
    return src('./src/resources/**')
        .pipe(dest('./build'))
}

const fontsConversion = () => {
    src('./src/fonts/**.ttf')
        .pipe(ttf2woff())
        .pipe(dest('./build/fonts'))
    return src('./src/fonts/**.ttf')
        .pipe(ttf2woff2())
        .pipe(dest('./build/fonts'))
}

const clean = () => {
    return del('./buuld/**');
}

const scriptsConversion = () => {
    return src('./src/js/index.js')
        .pipe(webpackStream({
            output: {
                filename: 'index.js'
            },
            module: {
                rules: [
                    {
                        test: /\.m?js$/,
                        exclude: /node_modules|tests/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: [
                                    ['@babel/preset-env', { targets: "defaults" }]
                                ]
                            }
                        }
                    }
                ]
            }
        }))
        .on('error', function (err) {
			console.error('WEBPACK ERROR', err);
			this.emit('end')
		})
        .pipe(sourcemaps.init())
        .pipe(uglify().on("error", notify.onError()))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('./build/js'))
        .pipe(browserSync.stream());
}

const watchFiles = () => {
	browserSync.init({
		server: {
			baseDir: "./build"
		}
	});

    watch('./src/index.html', htmlConversion);
	watch('./src/scss/**/*.scss', htmlConversion);
    watch('./src/fonts/**.ttf', fontsConversion);
	watch('./src/images/**.jpg', imgConversion);
	watch('./src/images/**.png', imgConversion);
	watch('./src/images/**.jpeg', imgConversion);
	watch('./src/images/**.svg', createSvgSprites);
	watch('./src/resources/**', resourcesConversion);
	watch('./src/js/**/*.js', scriptsConversion);
}

exports.htmlConversion = htmlConversion;
exports.stylesConversion = stylesConversion;
exports.fontsConversion = fontsConversion;
exports.imgConversion = imgConversion;
exports.createSvgSprites = createSvgSprites;
exports.resourcesConversion = resourcesConversion;
exports.scriptsConversion = scriptsConversion;

exports.default = series(clean, parallel(htmlConversion, scriptsConversion, stylesConversion, fontsConversion, imgConversion, createSvgSprites, resourcesConversion), watchFiles);

const stylesConversionBuild = () => {
    return src('./src/scss/main.scss')
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', notify.onError()))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(cleanCss({
            level: 2
        }))
        .pipe(dest('./build/style'));
}

const scriptsConversionBuild = () => {
    return src('./src/js/index.js')
        .pipe(webpackStream({
            output: {
                filename: 'index.js'
            },
            module: {
                rules: [
                    {
                        test: /\.m?js$/,
                        exclude: /node_modules|tests/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: [
                                    ['@babel/preset-env', { targets: "defaults" }]
                                ]
                            }
                        }
                    }
                ]
            }
        }))
        .pipe(uglify().on("error", notify.onError()))
        .pipe(dest('./build/js'))
}

exports.stylesConversionBuild = stylesConversionBuild;
exports.scriptsConversionBuild = scriptsConversionBuild;

exports.build = series(clean, parallel(htmlConversion, scriptsConversionBuild, stylesConversionBuild, fontsConversion, imgConversion, createSvgSprites, resourcesConversion));