import gulp from 'gulp'
import image from 'gulp-image'
import newer from 'gulp-newer'
import webp from 'gulp-webp'

const { src, dest } = gulp

const options = {
  mode: 'dev', // 'dev' || 'stage'
  concurrent: 4,
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
  const { mode, concurrent } = options
  const modeProps = _getProps(mode)
  const _props = {
    ...modeProps,
    concurrent,
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
  options.concurrent = !isNaN(parseInt(concurrentArg))
    ? parseInt(concurrentArg)
    : options.concurrent

  switch (modeArg) {
    case 'stage':
    case 'dev':
      options.mode = modeArg
      break

    default:
      options.mode = 'dev'
      break
  }

  console.dir(options)
  optimize(options).then(() => done())
}
