
# Edits

> ! This repo is a fork of [barry-luijten fork](https://github.com/barry-luijten/pigallery2) of [PiGallery2](https://github.com/bpatrik/pigallery2) with these edits:

## Known issues

- Source: App crashes when a file/folder has a `%` in it's name

## New features

- Dark theme (kudos to [barry-luijten fork](https://github.com/barry-luijten/pigallery2))
  - Changed the tint to be darker
  - Made it the default setting
  - Darkened placeholder images and icons
  - Changed Android statusbar to black
  - Use [lightgallery.js](https://sachinchoolur.github.io/lightgallery.js/) and [videojs](https://videojs.com/) instead of the default lightbox (See Client.Other.disableLightGallery setting)
  - Improvements to lightGallery and videoJs themes and functionality

## Improvements

### Frontend

- Limit height of directory names
- Always show image info box on mobile
- Disable over the top loading animations

### Backend

- [Fix urlBase config](https://github.com/tuur29/pigallery2/blob/f24248672b44fd7bacf0c9ac1b79775a799e374a/src/frontend/index.html#L4)
- Serve web manifest to allow Chrome to display this as an app
- Stop returning 401 error codes as [this resets the browsers auth cache](https://stackoverflow.com/a/44123562) which causes problems with nginx basic auth


### Dev

- Disabled all languages except English to speed up build time significantly
- Ignore demo images to test own galleries instead of default demo images
- Auto reload server when files change
