import {Express, NextFunction, Request, Response} from 'express';
import * as path from 'path';
import * as fs from 'fs';
import * as ejs from 'ejs';
import {Config} from '../../common/config/private/Config';
import {ProjectPath} from '../ProjectPath';
import {AuthenticationMWs} from '../middlewares/user/AuthenticationMWs';
import {CookieNames} from '../../common/CookieNames';
import {ErrorCodes, ErrorDTO} from '../../common/entities/Error';
import {UserDTO} from '../../common/entities/UserDTO';

declare global {
  namespace Express {
    interface Request {
      locale?: string;
      localePath?: string;
      tpl?: any;
    }

    interface Response {
      tpl?: any;
    }
  }
}

export class PublicRouter {


  public static route(app: Express) {
    const setLocale = (req: Request, res: Response, next: Function) => {
      let localePath = '';
      let selectedLocale = req['locale'];
      if (req.cookies && req.cookies[CookieNames.lang]) {
        if (Config.Client.languages.indexOf(req.cookies[CookieNames.lang]) !== -1) {
          selectedLocale = req.cookies[CookieNames.lang];
        }
      }
      if (selectedLocale !== 'en') {
        localePath = selectedLocale;
      }
      res.cookie(CookieNames.lang, selectedLocale);
      req['localePath'] = localePath;
      next();
    };

    const renderIndex = (req: Request, res: Response, next: Function) => {
      ejs.renderFile(path.join(ProjectPath.FrontendFolder, req['localePath'], 'index.html'),
        res.tpl, (err, str) => {
          if (err) {
            return next(new ErrorDTO(ErrorCodes.GENERAL_ERROR, err.message));
          }
          res.send(str);
        });
    };


    const redirectToBase = (locale: string) => {
      return (req: Request, res: Response) => {
        if (Config.Client.languages.indexOf(locale) !== -1) {
          res.cookie(CookieNames.lang, locale);
        }
        res.redirect('/?ln=' + locale);
      };
    };

    app.use(
      (req: Request, res: Response, next: NextFunction) => {
        res.tpl = {};

        res.tpl.user = null;
        if (req.session.user) {
          res.tpl.user = <UserDTO>{
            id: req.session.user.id,
            name: req.session.user.name,
            csrfToken: req.session.user.csrfToken,
            role: req.session.user.role,
            usedSharingKey: req.session.user.usedSharingKey,
            permissions: req.session.user.permissions
          };

          if (!res.tpl.user.csrfToken && req.csrfToken) {
            res.tpl.user.csrfToken = req.csrfToken();
          }
        }
        res.tpl.clientConfig = {Client: Config.Client.toJSON({attachVolatile: true})};

        return next();
      });

    app.get('/heartbeat',
      (req: Request, res: Response, next: NextFunction) => {
        res.sendStatus(200);
      }
    );

      // Serve a web manifest so the site can be used as a web app
    app.get('/gallery/manifest.json',
      (req: Request, res: Response, next: NextFunction) => {
        res.send({
          name: Config.Client.applicationTitle,
          icons: [
            {
              src: '../assets/icon_inv.png',
              sizes: '48x48 72x72 96x96 128x128 256x256'
            }
          ],
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: Config.Client.publicUrl,
          background_color: '#000000',
          theme_color: '#000000'
        });
      }
    );

    app.get(['/', '/login', '/gallery*', '/share*', '/admin', '/duplicates', '/faces', '/search*'],
      AuthenticationMWs.tryAuthenticate,
      setLocale,
      renderIndex
    );
    Config.Client.languages.forEach(l => {
      app.get(['/' + l + '/', '/' + l + '/login', '/' + l + '/gallery*', '/' + l + '/share*', '/' + l + '/admin', '/' + l + '/search*'],
        redirectToBase(l)
      );
    });

    const renderFile = (subDir: string = '') => {
      return (req: Request, res: Response) => {
        const file = path.join(ProjectPath.FrontendFolder, req['localePath'], subDir, req.params.file);
        fs.exists(file, (exists: boolean) => {
          if (!exists) {
            return res.sendStatus(404);
          }
          res.sendFile(file);
        });
      };
    };

    app.get('/assets/:file(*)',
      setLocale,
      AuthenticationMWs.normalizePathParam('file'),
      renderFile('assets'));
    app.get('/:file',
      setLocale,
      AuthenticationMWs.normalizePathParam('file'),
      renderFile());

  }

}
