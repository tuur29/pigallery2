
# Edits

> ! This repo is a fork of [barry-luijten fork](https://github.com/barry-luijten/pigallery2) of [PiGallery2](https://github.com/bpatrik/pigallery2) with these edits:

- Dark theme (kudos to [barry-luijten fork](https://github.com/barry-luijten/pigallery2))
  - Changed the tint to be darker
  - Made it the default setting
  - Changed Android statusbar to black
- Use [lightgallery.js](https://sachinchoolur.github.io/lightgallery.js/) and [videojs](https://videojs.com/) instead of the default lightbox
  - Improvements to lightGallery and videoJs themes and functionality
- Disabled all languages except English to speed up build time significantly
- Ignore demo images to test own galleries instead of default demo images
- [Fix urlBase config](https://github.com/tuur29/pigallery2/blob/f24248672b44fd7bacf0c9ac1b79775a799e374a/src/frontend/index.html#L4)
- Auto reload server when files change
- Limit height of directory names
