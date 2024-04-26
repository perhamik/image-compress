import gulp from 'gulp'
import flatMap from 'flat-map'
import { basename } from 'path'
import image from 'gulp-image'
import newer from 'gulp-newer'
import scaleImages from 'gulp-scale-images'
import webp from 'gulp-webp'

const { src, dest } = gulp

const options = {
  mode: 'dev', // 'dev' || 'stage' || 'prod'
  tasks: 4,
}

const _path = {
  ext: '{jpg,JPG,jpeg,JPEG,png,svg,gif}',
  resizeExt: '{jpg,jpeg,png}',
  src: 'img-src',
  out: {
    main: 'img',
    webp: 'webp',
    resize: 'resize',
  },
}

const _size = {
  maxWidth: 1920, // optional maximum width
  maxHeight: 1080, // optional maximum height
  withoutEnlargement: true, // optional, default is true
  fit: 'inside', // optional, default is 'cover', one of ('cover', 'contain', 'fill', 'inside', 'outside')
  //rotate: true, // optional
  metadata: false, // copy metadata over?
  formatOptions: {}, // optional, additional format options for sharp engine
}

const _propsDev = {
  pngquant: false, //lossy
  optipng: ['-i 0', '-strip all', '-verbose', '-force'], //lossless
  zopflipng: false, //lossless
  mozjpeg: ['-optimize', '-progressive'],
  jpegRecompress: false, //['--strip', '--quality', 'high', '--min', 70, '--max', 90],
  gifsicle: ['--optimize=3'],
  svgo: ['--enable', 'cleanupIDs', '--disable', 'convertColors'],
  quiet: false, // defaults to false
}

const _propsStage = {
  ..._propsDev,
  zopflipng: ['-y', '-m', '--lossy_8bit', '--lossy_transparent'], //lossless
}

const renderImage = async (
  srcPath = _path.src,
  pipeFunc,
  outPath = _path.out.main
) => {
  await new Promise((resolve) => {
    src(srcPath)
      .pipe(newer(outPath))
      .pipe(pipeFunc)
      .pipe(dest(outPath))
      .on('end', resolve)
  })
}

const changeFileName = (output, scale, cb) => {
  const fileName = [
    basename(output.path, output.extname), // strip extension
    scale.format || output.extname,
  ].join('')
  cb(null, fileName)
}

export const resizeImages = async () => {
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

export const toWebp = () => {
  const src = `${_path.src}/**/*.${_path.resizeExt}`
  return renderImage(src, webp(), _path.out.webp)
}

const _getProps = (mode = options.mode) => {
  switch (mode) {
    case 'stage':
      return _propsStage
    case 'dev':
    default:
      return _propsDev
  }
}

const optimize = (options) => {
  const { mode, tasks } = options
  const _props = {
    concurrent: tasks,
    ..._getProps(mode),
  }
  const src = `${_path.src}/**/*.${_path.ext}`
  return renderImage(src, image(_props))
}

export const build = (done) => {
  const args = process.argv.splice(3, process.argv.length - 3)
  const concurrentArg = args
    .find((item) => item.includes('concurrent'))
    ?.split('=')
    ?.at(1)
  const modeArg = args
    .find((item) => item.includes('mode'))
    ?.split('=')
    ?.at(1)
  options.tasks = !isNaN(parseInt(concurrentArg))
    ? parseInt(concurrentArg)
    : options.tasks

  switch (modeArg) {
    case 'stage':
    case 'dev':
      options.mode = modeArg
      break

    default:
      options.mode = 'dev'
      break
  }

  console.log(`MODE: ${options.mode}`)
  console.log(`Concurrent: ${options.tasks}`)
  optimize(options).then(() => done())
}
