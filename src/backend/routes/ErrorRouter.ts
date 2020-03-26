import {RenderingMWs} from '../middlewares/RenderingMWs';
import {ErrorCodes, ErrorDTO} from '../../common/entities/Error';
import {Logger} from '../Logger';
import {Express, Request, Response} from 'express';

export class ErrorRouter {
  public static route(app: Express) {

    this.addApiErrorHandler(app);
    this.addGenericHandler(app);
  }

  private static addApiErrorHandler(app: Express) {
    app.use('/api/*',
      RenderingMWs.renderError
    );
  }

  private static addGenericHandler(app: Express) {
    app.use((err: any, req: Request, res: Response, next: Function) => {

        if (err.name === 'UnauthorizedError') {
          // jwt authentication error
          res.status(403);
          return next(new ErrorDTO(ErrorCodes.NOT_AUTHENTICATED, 'Invalid token'));
        }

        // Flush out the stack to the console
        Logger.error('Unexpected error:');
        console.error(err);
        return next(new ErrorDTO(ErrorCodes.SERVER_ERROR, 'Unknown server side error', err));
      },
      RenderingMWs.renderError
    );
  }

}
