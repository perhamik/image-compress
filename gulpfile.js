const { src, dest, series, parallel } = require('gulp')
const flatMap = require('flat-map').default
const path = require('path')
const image = require('gulp-image')
const newer = require('gulp-newer')
const scaleImages = require('gulp-scale-images')
const webp = require('gulp-webp')

const options = {
	mode: 'dev',	// 'dev' || 'stage' || 'prod'
	tasks: 6
}


const _path = {
	ext: '{jpg,jpeg,png,svg,gif}',
	resizeExt: '{jpg,jpeg,png}',
	src: 'img-src',
	out: {
		main: 'img',
		webp: 'webp',
		resize: 'resize'
	}
}

const _size = {
	maxWidth: 1920, // optional maximum width
	maxHeight: 1080, // optional maximum height
	withoutEnlargement: true, // optional, default is true
	fit: 'inside', // optional, default is 'cover', one of ('cover', 'contain', 'fill', 'inside', 'outside')
	//rotate: true, // optional
	metadata: false, // copy metadata over?
	formatOptions: {} // optional, additional format options for sharp engine
}

const _propsDev = {
	pngquant: false, //lossy
	optipng: ['-i 0', '-strip all', '-verbose', '-o1', '-force'], //lossless
	zopflipng: false,  //lossless
	jpegRecompress: false, //['--strip', '--quality', 'high', '--min', 70, '--max', 90],
	mozjpeg: ['-optimize', '-progressive'],
	gifsicle: ['--optimize=1'],
	svgo: ['--enable', 'cleanupIDs', '--disable', 'convertColors'],
	concurrent: options.tasks, //max parallels tasks
	quiet: false, // defaults to false
}

const _propsStage = {
	pngquant: false, //lossy
	optipng: ['-i 0', '-strip all', '-verbose', '-force'], //lossless
	zopflipng: false, //lossless
	jpegRecompress: false, //['--strip', '--quality', 'high', '--min', 70, '--max', 90],
	mozjpeg: ['-optimize', '-progressive'],
	gifsicle: ['--optimize=3'],
	svgo: ['--enable', 'cleanupIDs', '--disable', 'convertColors'],
	concurrent: options.tasks, //max parallels tasks
	quiet: false, // defaults to false
}

const _propsProd = {
	pngquant: false, //lossy
	optipng: ['-i 0', '-strip all', '-verbose', '-force'], //lossless
	zopflipng: ['-y', '-m', '--lossy_8bit', '--lossy_transparent'], //lossless
	jpegRecompress: false, //['--strip', '--quality', 'high', '--min', 70, '--max', 90],
	mozjpeg: ['-optimize', '-progressive'],
	gifsicle: ['--optimize=3'],
	svgo: ['--enable', 'cleanupIDs', '--disable', 'convertColors'],
	concurrent: options.tasks, //max parallels tasks
	quiet: false, // defaults to false
}

const renderImage = async (srcPath = _path.src, pipeFunc, outPath = _path.out.main) => {
	await new Promise((resolve) => {
		src(srcPath).pipe(newer(outPath)).pipe(pipeFunc).pipe(dest(outPath)).on('end', resolve)
	})
}

const changeFileName = (output, scale, cb) => {
	const fileName = [
		path.basename(output.path, output.extname), // strip extension
		scale.format || output.extname
	].join('')
	cb(null, fileName)
}

const resizeImages = async () => {
	await new Promise((resolve) => {
		src(`${_path.src}/**/*.${_path.resizeExt}`)
			.pipe(
				flatMap((file, cb) => {
					file.scale = _size
					cb(null, file)
				})
			)
			.pipe(scaleImages(changeFileName))
			.pipe(dest(_path.out.resize))
			.on('end', resolve)
	})
}

const toWebp = () => {
	const src = `${_path.src}/**/*.${_path.resizeExt}`
	return renderImage(src, webp(), _path.out.webp)
}

const _getProps = (mode = options.mode) => {
	if(mode === 'prod') return _propsProd
	else if(mode === 'stage') return _propsStage
	else return _propsDev
}

const optimize = (mode = options.mode) => {
	const _props = _getProps(mode)
	const src = `${_path.src}/**/*.${_path.ext}`
	return renderImage(src, image(_props))
}

const buildDev = (done) => {
	options.mode = 'dev'
	optimize('dev').then(() => done())
}

const buildStage = (done) => {
	options.mode = 'stage'
	optimize('stage').then(() => done())
}

const buildProd = (done) => {
	options.mode = 'prod'
	optimize('prod').then(() => done())
}

exports.webp = series(toWebp)
exports.images = series(optimize)
exports.resize = series(resizeImages)
exports.build = parallel(optimize, toWebp)
exports.buildDev = buildDev
exports.buildStage = buildStage
exports.buildProd = buildProd
