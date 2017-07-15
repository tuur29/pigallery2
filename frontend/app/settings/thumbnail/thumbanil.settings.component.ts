import {Component} from "@angular/core";
import {SettingsComponent} from "../_abstract/abstract.settings.component";
import {AuthenticationService} from "../../model/network/authentication.service";
import {NavigationService} from "../../model/navigation.service";
import {NotificationService} from "../../model/notification.service";
import {ThumbnailConfig, ThumbnailProcessingLib} from "../../../../common/config/private/IPrivateConfig";
import {ClientConfig} from "../../../../common/config/public/ConfigClass";
import {ThumbnailSettingsService} from "./thumbanil.settings.service";
import {Utils} from "../../../../common/Utils";

@Component({
  selector: 'settings-thumbnail',
  templateUrl: './thumbanil.settings.component.html',
  styleUrls: ['./thumbanil.settings.component.css',
    './../_abstract/abstract.settings.component.css'],
  providers: [ThumbnailSettingsService],
})
export class ThumbnailSettingsComponent extends SettingsComponent<{ server: ThumbnailConfig, client: ClientConfig.ThumbnailConfig }> {
  types: Array<any> = [];
  ThumbnailProcessingLib: any;

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: ThumbnailSettingsService,
              notification: NotificationService) {
    super("Thumbnail", _authService, _navigation, _settingsService, notification);
  }

  get ThumbnailSizes(): string {
    return this._settingsService.settings.client.thumbnailSizes.join("; ");
  }

  set ThumbnailSizes(value: string) {
    value = value.replace(new RegExp(',', 'g'), ";");
    value = value.replace(new RegExp(' ', 'g'), ";");
    this._settingsService.settings.client.thumbnailSizes = value.split(";").map(s => parseInt(s)).filter(i => !isNaN(i) && i > 0);
  }

  ngOnInit() {
    super.ngOnInit();
    this.types = Utils
      .enumToArray(ThumbnailProcessingLib).map((v) => {
        if (v.value.toLowerCase() == "sharp") {
          v.value += " (recommended)";
        }
        return v;
      });
    this.ThumbnailProcessingLib = ThumbnailProcessingLib;
  }

}


