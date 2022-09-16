const loadModule = async (path) => {
  const pkg = await import(path)
  return pkg['default'] ? pkg['default'] : pkg
}

let compress_images = () => {}

const props = {
  jpg: {
    engine: 'mozjpeg',
    command: ['-optimize', '-quality', '85'],
  },
  png: {
    engine: 'optipng',
    command: false,
  },

  gif: {
    engine: 'gifsicle',
    command: ['--colors', '64', '--use-col=web'],
  },
  svg: { engine: 'svgo', command: '--multipass' },
}

const handler = (error, completed, statistic) => {
  if (error && !!error) {
    console.error(error)
  }
}

const test = () => {
  compress_images(
    'img/**/*.{jpg,png,svg,gif}',
    'build/img/',
    { compress_force: false, statistic: true, autoupdate: false },
    false,
    { jpg: props.jpg },
    { png: props.png },
    { svg: { engine: 'svgo', command: '--multipass' } },
    {
      gif: { engine: 'gifsicle', command: ['--colors', '64', '--use-col=web'] },
    },
    handler
  )
}

const main = async () => {
  const pkg = await loadModule('compress-images')
  if (pkg) {
    compress_images = pkg
  } else {
    return
  }
  test()
}

main()
