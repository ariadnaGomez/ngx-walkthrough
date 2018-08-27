import { NgModule, ModuleWithProviders } from "@angular/core";
import { WalkthroughComponent } from "./components/ngx-walkthrough";
import { IonicModule } from "ionic-angular";

@NgModule({
  imports: [IonicModule],
  declarations: [WalkthroughComponent],
  exports: [WalkthroughComponent]
})
export class IonicAcademyModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IonicAcademyModule
    };
  }
}
