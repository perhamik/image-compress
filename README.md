# IMAGEMIN

## Usage

Install the dependencies with: `npm install` from `package.json`.

### Customization

Use `_path`, `_size`, `_props` variables

#### Custom input/output folders

```javascript
const _path = {
   ext: '{jpg,jpeg,png,svg}',
   src: 'img-src',
   out: {
   main: 'img',
      webp: 'webp',
      clone: 'clone',
      resize: 'resize'
   }
}
```

#### Custom compress properties

```javascript
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
```

#### Custom resize options

```javascript
const _size = {
   maxWidth: 1920, // optional maximum width
   maxHeight: 1080, // optional maximum height
   withoutEnlargement: true, // optional, default is true
   fit: 'inside', // optional, default is 'cover', one of ('cover', 'contain', 'fill', 'inside', 'outside')
   //rotate: true, // optional
   metadata: true, // copy metadata over?
   formatOptions: {} // optional, additional format options for sharp engine
}
```

### Usage

`gulp images` – compress images `_path.src` → `_path.out.main`  
`gulp webp` – conver to .webp `_path.src` → `_path.out.webp`
`gulp resize` – resize images `_path.src` → `_path.out.resize`
`gulp build` – compress images & conver to .webp

```javascript
exports.webp = series(toWebp)
exports.images = series(optimize)
exports.resize = series(resizeImages)
exports.build = parallel(this.images, toWebp)
```

## License

Copyright © 2021 Denys Yaroshenko under the MIT license.
