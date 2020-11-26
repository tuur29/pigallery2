import {setHashParam, removeHashParam, getHashParam} from '../../../utils';

declare var lightGallery: any;
declare var videojs: any;

export const setupLightGallery = (): void => {
  const el = document.querySelector('#gallery');

  if (el && (window as any).lgData[el.getAttribute('lg-uid')]) {
    (window as any).lgData[el.getAttribute('lg-uid')].destroy(true);
  }

  setTimeout(() => {
    lightGallery(el, {
      selector: 'a.lightbox',
      controls: true,
      loop : false,
      download: true,
      counter: true,
      videojs: true,
      // Custom options
      mode: 'lg-slide',
      speed: 200,
      hideBarsDelay: 3000,
      closable: false,
      hideControlOnEnd: true,
      preload: 2,
      swipeThreshold: 40,
      getCaptionFromTitleOrAlt: false,
      videojsOptions: {
          fluid: true,
          controlBar: {
            volumePanel: {
              inline: false
            }
          },
          plugins: {
            extraButtons: {
              quickBackward: { seconds: 30 },
              quickForward: { seconds: 30 }
            },
            tapSkip: true,
          }
      },
      share: false,
      pager: false,
      hash: false,
      thumbContHeight: 120,
      thumbWidth: 100,
      showThumbByDefault: false,
      videoMaxWidth: 'initial',
      pause: 3000,
      zoom: false, // zoom plugin has performance issues on mobile: https://github.com/sachinchoolur/lg-zoom.js/issues/1
      scale: 0.5,
    });

     // Add VideoJS plugin for double tap to skip on mobile
    videojs.registerPlugin('tapSkip', function() {
      const player = this;

      let lastPress = 0;
      let timeout: any = null;

      // Pausing is broken on mobile, looks like the click handler toggles the playing state twice, this toggles a third time after 2ms
      player.on('pause', function(event: any) {
        setTimeout(() => {
          if (!player.paused()) {
              player.pause();
          }
        }, 2);
      });

      player.on('touchend', function(event: any) {
        if (event.target.nodeName.toLowerCase() !== 'video') {
          return;
        }

        const currentPress = Date.now();
          if (currentPress - lastPress < 500) {
            player.currentTime(player.currentTime() + 30);
            player.play();
            lastPress = 0;
            if (timeout) {
              clearTimeout(timeout);
              timeout = null;
            }
          } else {
            lastPress = currentPress;
          }
      });
    });

    // Allow back button to close lightbox and push link to actual file
    const updateHistory = () => {
      const id = el.getAttribute('lg-uid');
      const lightbox = window.lgData[id];
      const filename = lightbox.items[lightbox.index].getAttribute('id');
      const title = document.title.split(' - ')[0] + ' - ' + filename;

      return { lightbox, filename, title };
    };

    let listener: any = null;
    el.addEventListener('onAfterOpen', () => {
      const { lightbox, filename, title } = updateHistory();
      const newUrl = window.location.href.split('#')[0] + setHashParam('file', filename);
      window.history.pushState('forward', title, newUrl);
      listener = window.addEventListener('popstate', () => {
        lightbox.destroy();
      });
    }, false);

    el.addEventListener('onAfterSlide', () => {
      const { filename, title } = updateHistory();
      document.title = title;
      const newUrl = window.location.href.split('#')[0] + setHashParam('file', filename);
      window.history.replaceState('forward', title, newUrl);
    }, false);

    el.addEventListener('onBeforeClose', () => {
      if (listener) {
        el.removeEventListener('popstate', listener);
      }
      document.title = document.title.split(' - ')[0];
      const newUrl = window.location.href.split('#')[0] + removeHashParam('file');
      window.history.replaceState('forward', null, newUrl);
    }, false);

    window.addEventListener('beforeunload', () => {
      document.title = document.title.split(' - ')[0];
    });

    // scroll to and open item that was references in url
    const hashFilename = getHashParam('file');
    if (hashFilename) {
      const element = document.querySelector(`#${hashFilename}`);
      if (element) {
        setTimeout(() => {
          window.scrollTo({ top: element.getBoundingClientRect().top });
          try {
            (element as any).click();
          } catch {}
        }, 250);
      }
    }

  }, 50);
};
