import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  ViewChild,
  ElementRef,
  AfterViewInit
} from "@angular/core";
import {
  doubleTapIcon,
  singleTapIcon,
  swipeDownIcon,
  swipeRightIcon,
  swipeUpIcon,
  swipeLeftIcon,
  closeIcon
} from "./walkthrough.tap-icons";
import { fromEvent } from "rxjs/observable/fromEvent";
import { map } from "rxjs/operators";

const HTML_TEMPLATE = `
<div class="walkthrough-background"
     [ngClass]="{'walkthrough-active': isActiveWalkthrough}"
     *ngIf="isActiveWalkthrough"
     (click)="onCloseClicked($event)">
  <div class="walkthrough-container walkthrough-container-transparency"
       *ngIf="walkthroughType=='transparency'">
    <div class="walkthrough-inner"
         [ngClass]="{'walkthrough-top': (!forceCaptionLocation || forceCaptionLocation=='TOP'), 'walkthrough-bottom': forceCaptionLocation=='BOTTOM'}">
      <!-- <div class="walkthrough-transclude">
        <ng-content></ng-content>
      </div> -->
      <div [ngStyle]="textStylePosition"
           #text
           class="walkthrough-text-container">
        <pre class="walkthrough-element walkthrough-text"
             [innerHtml]="mainCaption">',
                                '</pre>
      </div>
      <img class="walkthrough-element walkthrough-icon"
           #icon
           [ngStyle]="iconLocationStyle"
           *ngIf="icon && icon!='arrow'"
           [src]="walkthroughIcon">
      <div class="walkthrough-element walkthrough-arrow"
           #icon
           [ngStyle]="iconLocationStyle"
           *ngIf="icon=='arrow'||icon=='arrow_vertical'">
      </div>
      <svg width="100%"
           height="100%">
        <defs>
        <marker id="arrow"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z"
                style="fill:#fff;" />
        </marker>
              </defs>
              <path [attr.d]="arrowPath" style="stroke:#fff; stroke-width: 2px; fill: none; marker-end: url(#arrow);"/>
      </svg>
      <div>
        <button class="walkthrough-element walkthrough-button-positive walkthrough-done-button"

                type="button"
                *ngIf="buttonCaption"
                (click)="onCloseClicked($event)">
                                {{buttonCaption}}
                            </button>
      </div>
    </div>
  </div>
  <div class="walkthrough-container walkthrough-container-tip"
       #text
       *ngIf="walkthroughType=='tip'">
    <div class="walkthrough-transclude"
         ng-transclude></div>
    <div class="walkthrough-inner"
         [ngClass]="{'walkthrough-top': ((!forceCaptionLocation && !tipLocation) || forceCaptionLocation=='TOP' || tipLocation =='TOP'), 'walkthrough-bottom': (forceCaptionLocation=='BOTTOM' || tipLocation =='BOTTOM')}">
      <img class="walkthrough-element walkthrough-tip-icon-text-box"
           [ngClass]="{'walkthrough-tip-icon-image-front': tipIconLocation=='FRONT', 'walkthrough-tip-icon-image-back': tipIconLocation=='BACK'}"

           [hidden]="icon=='arrow'"
           [src]="walkthroughIcon"
           alt="icon">
      <button class="walkthrough-done-button walkthrough-tip-done-button-text-box"
              type="button"
              *ngIf="buttonCaption"
              (click)="onCloseClicked($event)">
        <img class="walkthrough-tip-button-image-text-box" [src]="closeIcon" alt="x">
                      </button>
      <pre class="walkthrough-element walkthrough-tip-text-box"
           [ngClass]="{'walkthrough-tip-text-box-color-black': tipColor=='BLACK', 'walkthrough-tip-text-box-color-white': tipColor=='WHITE'}"

           [innerHtml]="mainCaption">
                        </pre>
    </div>
  </div>
  <div [hidden]="walkthroughType!='transparency' && !focusElementId"
       class="walkthrough-hole"
       #hole
       [ngStyle]="holeStyle"
       [ngClass]="{'walkthrough-hole-round': isRound}">
  </div>
  <div [hidden]="!hasGlow || !focusElementId"
       class="walkthrough-hole walkthrough-hole-glow"
       [ngClass]="{'walkthrough-hole-round': isRound}">
  </div>
`;

const CSS_STYLE = `
.walkthrough-hole-glow {
  position: absolute;
  outline: none;
  border: 2px solid #FFFF66 !important;
  box-shadow: 0 0 36px #FFFF66 !important;
  -webkit-appearance: none;
  box-sizing: border-box;
}

.walkthrough-background {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: initial;
  text-align: center;
  -webkit-transition: height 0s ease-out .2s, opacity .2s ease-out;
  -moz-transition: height 0s ease-out .2s, opacity .2s ease-out;
  -o-transition: height 0s ease-out .2s, opacity .2s ease-out;
  transition: height 0s ease-out .2s, opacity .2s ease-out;
  opacity: 0;
  height: 0;
  overflow: hidden;
  z-index: 1000;
}

.walkthrough-hole {
  position: absolute;
  -moz-box-shadow: 0 0 0 1997px rgba(0, 0, 0, .8);
  -webkit-box-shadow: 0 0 0 1997px rgba(0, 0, 0, .8);
  box-shadow: 0 0 0 1997px rgba(0, 0, 0, .8);
  -webkit-appearance: none;
}

.walkthrough-element.walkthrough-text {
  padding-top: 10%;
  margin: 0 auto;
  width: 70%;
  color: #fff;
  text-align: center;
}

.walkthrough-element.walkthrough-done-button {
  position: absolute;
  bottom: 30px;
  height: 30px;
  width: 80px;
  display: inline-block;
  right: 30px;
  margin: 0 auto;
}

.walkthrough-button-positive {
  border-color: #0c63ee;
  background-color: #387ef5;
  color: #fff;
}

.walkthrough-button-positive:hover {
  color: #fff;
  text-decoration: none;
}

.walkthrough-button-positive.active {
  border-color: #0c63ee;
  background-color: #0c63ee;
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.1);
}

.walkthrough-element.walkthrough-icon {
  height: 200px;
}

.walkthrough-element.walkthrough-arrow {
  color: #ffffff;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.walkthrough-element {
  z-index: 1001;
  position: relative;
  margin-left: auto;
  margin-right: auto;
}

.walkthrough-background.walkthrough-active {
  -webkit-transition: opacity .2s ease-out;
  -moz-transition: opacity .2s ease-out;
  -o-transition: opacity .2s ease-out;
  transition: opacity .2s ease-out;
  opacity: 1;
  height: 100%;
}

.walkthrough-transclude {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
}

.walkthrough-hole-round {
  border-radius: 200px;
}

.walkthrough-tip-text-box {
  /*top: 128px;*/
  position: relative;
  margin-left: 16px;
  margin-right: 16px;
  border: 2px solid;
  border-radius: 35px;
  padding: 14px;
  /*margin-top: 0;*/
  /*margin-bottom: 0;*/
}

.walkthrough-container {
  float: left;
  position: relative;
  height: 100%;
  width: 100%;
}

.walkthrough-inner {
  position: fixed;
  z-index: 3;
  width: 100%;
}

.walkthrough-container-transparency>.walkthrough-inner {
  height: 100%;
}

.walkthrough-text-container {
  position: absolute;
  width: 100%;
}

.walkthrough-container-tip>.walkthrough-top,
.walkthrough-container-transparency>.walkthrough-top .walkthrough-text-container {
  top: 15px;
}

.walkthrough-container-tip>.walkthrough-top .walkthrough-text,
.walkthrough-container-transparency>.walkthrough-top .walkthrough-text-container .walkthrough-text {
  padding-bottom: 15px;
}

.walkthrough-container-tip>.walkthrough-bottom {
  bottom: 0;
}

/* take 'done' button into consideration */

.walkthrough-container-transparency .walkthrough-bottom .walkthrough-text-container {
  bottom: 70px;
}

.walkthrough-container-transparency .walkthrough-bottom .walkthrough-text-container .walkthrough-text {
  padding-top: 15px;
}

.walkthrough-tip-icon-image-front {
  z-index: 1002;
}

.walkthrough-tip-icon-image-back {
  z-index: 999;
}

.walkthrough-tip-icon-text-box {
  height: 142px;
  /*right: 9%;*/
  position: relative;
  margin-bottom: -32px;
  margin-right: -250px;
  /*bottom: 70px;*/
}

.walkthrough-tip-done-button-text-box {
  /*top: 109px;*/
  /*bottom: 59px;*/
  position: relative;
  z-index: 1002;
  /*right: -7px;*/
  margin-top: 107px;
  background-color: transparent;
  border: 0;
  float: right;
}

.walkthrough-tip-button-image-text-box {
  width: 42px;
  height: 42px;
}

.walkthrough-tip-text-box-color-black {
  border-color: #ffffff;
  background-color: #000000;
  color: #ffffff;
}

.walkthrough-tip-text-box-color-white {
  border-color: #000000;
  background-color: #ffffff;
}
`;

@Component({
  selector: "walkthrough",
  template: HTML_TEMPLATE,
  styles: [CSS_STYLE]
})
export class WalkthroughComponent implements OnInit, OnChanges {
  @Input("isActive")
  isActive;
  @Input("walkthroughType")
  walkthroughType;
  @Input("icon")
  icon;
  @Input("focusElementId")
  focusElementId;
  @Input("mainCaption")
  mainCaption;
  @Input("forceCaptionLocation")
  forceCaptionLocation = "TOP";
  @Input("isRound")
  isRound;
  @Input("hasGlow")
  hasGlow;
  @Input("buttonCaption")
  buttonCaption;
  @Input("iconPaddingLeft")
  iconPaddingLeft;
  @Input("iconPaddingTop")
  iconPaddingTop;
  @Input("tipLocation")
  tipLocation;
  @Input("tipIconLocation")
  tipIconLocation;
  @Input("tipColor")
  tipColor;
  @Input("isBindClickEventToBody")
  isBindClickEventToBody;
  @Input("textPosition")
  textPosition;
  @Output()
  onWalkthroughShow: EventEmitter<any> = new EventEmitter();
  @Output()
  onWalkthroughHide: EventEmitter<any> = new EventEmitter();
  @ViewChild("text", { read: ElementRef })
  textElement: ElementRef;
  @ViewChild("icon", { read: ElementRef })
  iconElement: ElementRef;
  private DOM_WALKTHROUGH_DONE_BUTTON_CLASS = "walkthrough-done-button";
  private PADDING_HOLE = 5;
  private PADDING_ARROW_START = 5;
  private clickSubscription;
  private resizeSubscription;
  textStylePosition = null;
  isActiveWalkthrough = false;
  closeIcon;
  walkthroughIcon;
  holeStyle;
  iconLocationStyle: any = {};
  arrowPath;
  headerHeight = 0;
  iconStyle;
  ngOnInit() {
    if (this.textPosition) {
      this.textStylePosition = {
        top: `${this.textPosition}px`,
        bottom: "auto"
      };
    }
    setTimeout(() => {
      this.closeIcon = closeIcon;
    }, 100);
    this.walkthroughIcon = this.getIcon();
    const header = document.getElementsByTagName("ion-header");
    header.item(0).setAttribute("style", "z-index: 1;");
    const isHeaderFocusElement =
      header[0].getAttribute("id") === this.focusElementId;
    const isFocusElementInHeader = header[0].querySelectorAll(
      `#${this.focusElementId}`
    ).length;
    if (!isFocusElementInHeader && !isHeaderFocusElement) {
      this.headerHeight = header.item(0).clientHeight;
    }
  }

  ngOnChanges() {
    this.isActiveWalkthrough = this.isActive;
    this.bindResizeHandler();
    if (this.isBindClickEventToBody) {
      this.bindClickEvent();
    }
    try {
      if (this.focusElementId) {
        this.setElementLocations();
      }
    } catch (e) {
      console.log(
        "failed to focus on element prior to timeout: " + this.focusElementId
      );
    }
    if (this.focusElementId) {
      setTimeout(() => {
        this.setElementLocations();
      }, 300);
    }
    //}
    this.onWalkthroughShow.emit();
  }

  private getIcon() {
    var iconSelected = null;
    switch (this.icon) {
      case "single_tap":
        iconSelected = singleTapIcon;
        break;
      case "double_tap":
        iconSelected = doubleTapIcon;
        break;
      case "swipe_down":
        iconSelected = swipeDownIcon;
        break;
      case "swipe_left":
        iconSelected = swipeLeftIcon;
        break;
      case "swipe_right":
        iconSelected = swipeRightIcon;
        break;
      case "swipe_up":
        iconSelected = swipeUpIcon;
        break;
      case "arrow":
        iconSelected = "";
        break;
      case "arrow_vertical":
        iconSelected = "";
        break;
    }
    if (iconSelected === null && this.icon && this.icon.length > 0) {
      iconSelected = this.icon;
    }
    return iconSelected;
  }

  private clickFunction(event: Event) {
    if (!this.buttonCaption) {
      event.stopPropagation();
      event.preventDefault();
      this.onCloseClicked(event);
      const header = document.getElementsByTagName("ion-header");
      header.item(0).setAttribute("style", "z-index: 10;");
      setTimeout(() => {
        this.unbindClickEvent();
      }, 1000);
    }
  }

  private bindClickEvent() {
    const sub = fromEvent(window, "resize");
    const example = sub.pipe(map((event: Event) => event));
    this.clickSubscription = example.subscribe((event: Event) =>
      this.clickFunction(event)
    );
  }

  private unbindClickEvent() {
    this.clickSubscription.unsubscribe();
  }
  private unbindResizeEvent() {
    this.resizeSubscription.unsubscribe();
  }

  private bindResizeHandler() {
    const sub = fromEvent(window, "resize");
    const example = sub.pipe(map((event: Event) => event));
    this.resizeSubscription = example.subscribe((event: Event) =>
      this.resizeHandler(event)
    );
  }
  private resizeHandler(event: Event) {}

  private setFocus(left, top, width, height) {
    this.holeStyle = {
      left: left - this.PADDING_HOLE + "px",
      top: top + this.headerHeight - this.PADDING_HOLE + "px",
      width: width + 2 * this.PADDING_HOLE + "px",
      height: height + 2 * this.PADDING_HOLE + "px"
    };
    console.log(this.holeStyle);
  }

  private moveTextToBottom(newTop) {
    this.textStylePosition = {
      top: newTop + "px",
      "margin-top": "10px"
    };
  }

  closeWalkthrough() {
    this.isActive = false;
    this.isActiveWalkthrough = false;
    this.onWalkthroughHide.emit(false);
  }

  onCloseClicked(event: any) {
    event.stopPropagation();

    if (
      !this.buttonCaption ||
      event.currentTarget.className.indexOf(
        this.DOM_WALKTHROUGH_DONE_BUTTON_CLASS
      ) > -1
    ) {
      this.closeWalkthrough();
    }
  }

  private getOffsetCoordinates(focusElement) {
    const width = focusElement.nativeElement.offsetWidth;
    const height = focusElement.nativeElement.offsetHeight;
    let left = focusElement.nativeElement.offsetLeft;
    let top = focusElement.nativeElement.offsetTop;

    return { top: top, left: left, height: height, width: width };
  }

  isItemOnText(iconLeft, iconTop, iconRight, iconBottom) {
    const offsetCoordinates = this.getOffsetCoordinates(this.textElement);
    const textLeft = offsetCoordinates.left;
    const textRight = offsetCoordinates.left + offsetCoordinates.width;
    const textTop = offsetCoordinates.top;
    const textBottom = offsetCoordinates.top + offsetCoordinates.height;
    console.log(textRight, iconLeft);
    console.log(textLeft, iconRight);
    console.log(textBottom, iconTop);
    console.log(textTop, iconBottom);

    return !(
      textRight < iconLeft ||
      textLeft > iconRight ||
      textBottom < iconTop ||
      textTop > iconBottom
    );
  }

  setIconAndText(iconLeft, iconTop, paddingLeft, paddingTop) {
    var offsetCoordinates = this.getOffsetCoordinates(this.iconElement);
    var iconHeight = offsetCoordinates.height;
    var iconWidth = offsetCoordinates.width;
    var iconLeftWithPadding = iconLeft + paddingLeft;
    var iconTopWithPadding = iconTop + paddingTop + this.headerHeight;
    var iconRight = iconLeftWithPadding + iconWidth;
    var iconBottom = iconTopWithPadding + iconHeight;

    if (
      this.isItemOnText(
        iconLeftWithPadding,
        iconTopWithPadding,
        iconRight,
        iconBottom
      )
    ) {
      this.moveTextToBottom(iconBottom);
    }
    this.iconLocationStyle = {
      position: "absolute",
      left: `${iconLeftWithPadding}px`,
      top: `${iconTopWithPadding}px`,
      "margin-top": `-${iconTopWithPadding / 6}px`,
      "margin-left": `-${iconWidth / 4}px`
    };
  }

  setArrowAndText(
    pointSubjectLeft,
    pointSubjectTop,
    pointSubjectWidth,
    pointSubjectHeight,
    paddingLeft
  ) {
    var offsetCoordinates = this.getOffsetCoordinates(this.textElement);

    var startLeft = offsetCoordinates.left + offsetCoordinates.width / 2;
    var startTop = offsetCoordinates.top + this.PADDING_ARROW_START;

    if (!this.forceCaptionLocation || this.forceCaptionLocation === "TOP") {
      startTop += offsetCoordinates.height;
    }
    var endTop = 0;
    var endLeft = 0;

    if (startLeft > pointSubjectLeft) {
      endLeft = pointSubjectLeft + paddingLeft + pointSubjectWidth + 30;
      endTop = pointSubjectTop + pointSubjectHeight / 2;
    } else if (startLeft < pointSubjectLeft) {
      endLeft = pointSubjectLeft - paddingLeft - 30;
      endTop = pointSubjectTop + pointSubjectHeight / 2;
    }
    endTop += this.headerHeight;
    if (this.isItemOnText(startLeft, startTop, endLeft, endTop)) {
      this.moveTextToBottom(startTop);
    }
    this.arrowPath = `M${startLeft},${startTop} Q${startLeft},${endTop} ${endLeft},${endTop}`;
  }

  setVerticalArrowPath(pointSubjectTop, pointSubjectHeight) {
    var offsetCoordinates = this.getOffsetCoordinates(this.textElement);
    var left = offsetCoordinates.left + offsetCoordinates.width / 2;
    var startTop = offsetCoordinates.top + this.PADDING_ARROW_START - 30;
    var endTop = pointSubjectTop + pointSubjectHeight + 30;
    if (this.forceCaptionLocation === "TOP") {
      startTop += offsetCoordinates.height + 10;
      endTop = pointSubjectTop - 40;
    }
    this.arrowPath = `M${left} ${startTop}  L${left} ${endTop}`;
  }

  setTipIconPadding() {
    if (this.walkthroughType == "tip") {
      if (this.iconPaddingTop) {
        this.iconLocationStyle["margin-top"] = `${this.iconPaddingTop}px`;
      }
      if (this.iconPaddingLeft) {
        this.iconLocationStyle.right = `${this.iconPaddingLeft}%`;
      }
    }
  }

  setElementLocations() {
    const focusElement = document.getElementById(this.focusElementId);
    if (!focusElement) {
      if (this.focusElementId) {
        throw Error(
          `Unable to find element requested to be focused: #${
            this.focusElementId
          }`
        );
      }
    }
    var width = focusElement.offsetWidth;
    var height = focusElement.offsetHeight;
    var left = focusElement.offsetLeft;
    var top = focusElement.offsetTop;

    this.setFocus(left, top, width, height);
    var paddingLeft = parseFloat(this.iconPaddingLeft) | 0;
    var paddingTop = parseFloat(this.iconPaddingTop) | 0;

    if (
      this.walkthroughIcon &&
      this.walkthroughIcon !== "arrow" &&
      this.walkthroughIcon !== "arrow_vertical" &&
      this.walkthroughType === "transparency"
    ) {
      this.setIconAndText(
        left + width / 2,
        top + height / 2,
        paddingLeft,
        paddingTop
      );
    }
    if (this.icon === "arrow") {
      this.setArrowAndText(left, top + paddingTop, width, height, paddingLeft);
    }
    if (this.icon === "arrow_vertical") {
      this.setVerticalArrowPath(top + paddingTop, height);
    }
    this.setTipIconPadding();
  }
}
