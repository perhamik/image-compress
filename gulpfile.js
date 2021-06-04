const { src, dest, series, parallel } = require('gulp')
const flatMap = require('flat-map').default
const path = require('path')
const image = require('gulp-image')
const scaleImages = require('gulp-scale-images')
const webp = require('gulp-webp')

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

const _props = {
	pngquant: false, //lossy
	optipng: false, //lossless
	zopflipng: true, //lossless, slow
	jpegRecompress: false,
	mozjpeg: true,
	gifsicle: true,
	svgo: true,
	concurrent: 10, //max parallels tasks
	quiet: false // defaults to false
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
