const { src, dest, series, parallel } = require('gulp')
const flatMap = require('flat-map').default
const path = require('path')
const image = require('gulp-image')
const scaleImages = require('gulp-scale-images')
const webp = require('gulp-webp')

//const mode = 'dev'
const mode = 'prod'

const _path = {
	ext: '{jpg,jpeg,png,svg}',
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
	metadata: true, // copy metadata over?
	formatOptions: {} // optional, additional format options for sharp engine
}

const _propsDefaults = {
	pngquant: false, //lossy
	optipng: false, //lossless
	zopflipng: true, //lossless, slow
	jpegRecompress: false,
	mozjpeg: true,
	gifsicle: true,
	svgo: true,
	concurrent: mode === 'prod' ? 8 : 6, //max parallels tasks
	quiet: false // defaults to false
}

const _props = {
	pngquant: mode === 'prod' ? ['--speed=2', '--quality=65-90', '--force', 256] : false, //lossy
	optipng: mode === 'prod' ? ['-i 1', '-strip all', '-fix', '-o6', '-force'] : false, //['-i 1', '-strip all', '-fix', '-o7', '-force'], // //lossless
	zopflipng: mode === 'prod' ? ['-y', '--lossy_8bit', '--lossy_transparent'] : false, //['-y', '--lossy_8bit', '--lossy_transparent'], //lossless, slow
	jpegRecompress: false, //['--strip', '--quality', 'high', '--min', 70, '--max', 90],
	mozjpeg: ['-optimize', '-progressive'],
	gifsicle: mode === 'prod' ? ['--optimize=3'] : ['--optimize=1'],
	svgo: ['--enable', 'cleanupIDs', '--disable', 'convertColors'],
	concurrent: mode === 'prod' ? 16 : 6, //max parallels tasks
	quiet: false, // defaults to false
}

const renderImage = async (srcPath = _path.src, pipeFunc, outPath = _path.out.main) => {
	await new Promise((resolve) => {
		src(srcPath).pipe(pipeFunc).pipe(dest(outPath)).on('end', resolve)
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
	const src = `${_path.src}/**/*.{jpg,jpeg,png}`
	return renderImage(src, webp(), _path.out.webp)
}

const optimize = () => {
	const src = `${_path.src}/**/*.${_path.ext}`
	return renderImage(src, image(_props))
}

exports.webp = series(toWebp)
exports.images = series(optimize)
exports.resize = series(resizeImages)
exports.build = parallel(this.images, toWebp)
