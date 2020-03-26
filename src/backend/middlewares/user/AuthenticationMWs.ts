import {NextFunction, Request, Response} from 'express';
import {ErrorCodes, ErrorDTO} from '../../../common/entities/Error';
import {UserDTO, UserRoles} from '../../../common/entities/UserDTO';
import {ObjectManagers} from '../../model/ObjectManagers';
import {Config} from '../../../common/config/private/Config';
import {PasswordHelper} from '../../model/PasswordHelper';
import {Utils} from '../../../common/Utils';
import {QueryParams} from '../../../common/QueryParams';
import * as path from 'path';

export class AuthenticationMWs {

  public static async tryAuthenticate(req: Request, res: Response, next: NextFunction) {
    if (Config.Client.authenticationRequired === false) {
      req.session.user = <UserDTO>{name: UserRoles[Config.Client.unAuthenticatedUserRole], role: Config.Client.unAuthenticatedUserRole};
      return next();
    }
    try {
      const user = await AuthenticationMWs.getSharingUser(req);
      if (!!user) {
        req.session.user = user;
        return next();
      }
    } catch (err) {
    }

    return next();

  }

  public static async authenticate(req: Request, res: Response, next: NextFunction) {
    if (Config.Client.authenticationRequired === false) {
      req.session.user = <UserDTO>{name: UserRoles[Config.Client.unAuthenticatedUserRole], role: Config.Client.unAuthenticatedUserRole};
      return next();
    }

    // if already authenticated, do not try to use sharing authentication
    if (typeof req.session.user !== 'undefined') {
      return next();
    }

    try {
      const user = await AuthenticationMWs.getSharingUser(req);
      if (!!user) {
        req.session.user = user;
        return next();
      }
    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.CREDENTIAL_NOT_FOUND, null, err));
    }
    if (typeof req.session.user === 'undefined') {
      res.status(403);
      return next(new ErrorDTO(ErrorCodes.NOT_AUTHENTICATED, 'Not authenticated'));
    }
    return next();
  }


  public static normalizePathParam(paramName: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      req.params[paramName] = path.normalize(req.params[paramName] || path.sep).replace(/^(\.\.[\/\\])+/, '');
      return next();
    };
  }

  public static authorisePath(paramName: string, isDirectory: boolean) {
    return (req: Request, res: Response, next: NextFunction) => {
      let p: string = req.params[paramName];
      if (!isDirectory) {
        p = path.dirname(p);
      }

      if (!UserDTO.isDirectoryPathAvailable(p, req.session.user.permissions)) {
        return res.sendStatus(403);
      }

      return next();
    };
  }


  public static authorise(role: UserRoles) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (req.session.user.role < role) {
        return next(new ErrorDTO(ErrorCodes.NOT_AUTHORISED));
      }
      return next();
    };
  }

  public static async shareLogin(req: Request, res: Response, next: NextFunction) {

    if (Config.Client.Sharing.enabled === false) {
      return next();
    }
    // not enough parameter
    if ((!req.query[QueryParams.gallery.sharingKey_query] && !req.params[QueryParams.gallery.sharingKey_params])) {
      return next(new ErrorDTO(ErrorCodes.INPUT_ERROR, 'no sharing key provided'));
    }

    try {
      const password = (req.body ? req.body.password : null) || null;
      const sharingKey: string = req.query[QueryParams.gallery.sharingKey_query] || req.params[QueryParams.gallery.sharingKey_params];
      const sharing = await ObjectManagers.getInstance().SharingManager.findOne({
        sharingKey: sharingKey
      });

      if (!sharing || sharing.expires < Date.now() ||
        (Config.Client.Sharing.passwordProtected === true
          && (sharing.password)
          && !PasswordHelper.comparePassword(password, sharing.password))) {
        res.status(403);
        return next(new ErrorDTO(ErrorCodes.CREDENTIAL_NOT_FOUND));
      }

      let sharingPath = sharing.path;
      if (sharing.includeSubfolders === true) {
        sharingPath += '*';
      }

      req.session.user = <UserDTO>{
        name: 'Guest',
        role: UserRoles.LimitedGuest,
        permissions: [sharingPath],
        usedSharingKey: sharing.sharingKey
      };
      return next();

    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.GENERAL_ERROR, null, err));
    }

  }

  public static inverseAuthenticate(req: Request, res: Response, next: NextFunction) {
    if (typeof req.session.user !== 'undefined') {
      return next(new ErrorDTO(ErrorCodes.ALREADY_AUTHENTICATED));
    }
    return next();
  }

  public static async login(req: Request, res: Response, next: NextFunction) {

    if (Config.Client.authenticationRequired === false) {
      return res.sendStatus(404);
    }

    // not enough parameter
    if ((typeof req.body === 'undefined') ||
      (typeof req.body.loginCredential === 'undefined') ||
      (typeof req.body.loginCredential.username === 'undefined') ||
      (typeof req.body.loginCredential.password === 'undefined')) {
      return next(new ErrorDTO(ErrorCodes.INPUT_ERROR, 'not all parameters are included for loginCredential'));
    }
    try {
      // lets find the user
      const user = Utils.clone(await ObjectManagers.getInstance().UserManager.findOne({
        name: req.body.loginCredential.username,
        password: req.body.loginCredential.password
      }));
      delete (user.password);
      req.session.user = user;
      if (req.body.loginCredential.rememberMe) {
        req.sessionOptions.expires = new Date(Date.now() + Config.Server.sessionTimeout);
      }
      return next();

    } catch (err) {
      console.error(err);
      return next(new ErrorDTO(ErrorCodes.CREDENTIAL_NOT_FOUND, 'credentials not found during login'));
    }


  }

  public static logout(req: Request, res: Response, next: NextFunction) {
    delete req.session.user;
    return next();
  }

  private static async getSharingUser(req: Request) {
    if (Config.Client.Sharing.enabled === true &&
      (!!req.query[QueryParams.gallery.sharingKey_query] || !!req.params[QueryParams.gallery.sharingKey_params])) {
      const sharingKey: string = req.query[QueryParams.gallery.sharingKey_query] || req.params[QueryParams.gallery.sharingKey_params];
      const sharing = await ObjectManagers.getInstance().SharingManager.findOne({
        sharingKey: sharingKey
      });
      if (!sharing || sharing.expires < Date.now()) {
        return null;
      }

      if (Config.Client.Sharing.passwordProtected === true && sharing.password) {
        return null;
      }

      let sharingPath = sharing.path;
      if (sharing.includeSubfolders === true) {
        sharingPath += '*';
      }
      return <UserDTO>{
        name: 'Guest',
        role: UserRoles.LimitedGuest,
        permissions: [sharingPath],
        usedSharingKey: sharing.sharingKey
      };

    }
    return null;
  }

}
