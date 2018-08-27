# ngx-walkthrough

After not finding an Angular walkthrough/on-boarding/tour guide/learning page directive which was responsive, dynamic, easy to use and thus good for our [Fitness Meal Planner](http://www.fitnessmealplanner.com) mobile web App I decided to create one.

One of the most common design challenges emerging in mobile design is that of 'invitation' - creating an explanation walk through during user first interaction with the app so to engage him.
Following Theresa Neil's design patterns from [Mobile Design Pattern Gallery] (http://www.amazon.com/gp/product/1449314325/ref=as_li_ss_tl?ie=UTF8&tag=uxbo09-20&linkCode=as2&camp=217145&creative=399373&creativeASIN=1449314325)

This angular directive implements a walkthrough via one of the following patterns: the transparency pattern or the tip pattern (an explanation about the different patterns can be found online at [ux booth](http://www.uxbooth.com/articles/mobile-design-patterns/))

# Special features
 - Use the transparency walkthrough either using transclude or given attributes which contain basics such as text, gesture image, 'got it' button
 - In transparency walkthrough easily highlight a DOM element (see demo)
 - Use any image you want or choose a gesture image from the given collection (such as swipe with direction or tap) and place it bound to the element mentioned above.
 - automatically moves text to bottom if item is covering the text with icon or arrow
 - In tip mode add an Icon to sit on top or behind the tip text box

## ScreenShots
Transparency walkthrough in Classic, Classic with arrow mode and Totally customizable mode respectively:

![alt tag](/screenshots/screenshot1.png)
![alt tag](/screenshots/screenshot2.png)
![alt tag](/screenshots/screenshot3.png)

Tip walkthrough mode:

![alt tag](/screenshots/screenshot4.png)

## Requirements

- Angular

## Notes

This directive has been originally developed for the [Ionic Framework](http://ionicframework.com), so it supports both angular and ionic apps.

## Installation

* **NPM**: `npm install ngx-walkthrough`

## Usage


## Usage Example 1 - transparency Non transclude option

```html
<walkthrough
            isRound=true
            walkthroughType="transparency"
            focusElementId="focusItem"
            icon="single_tap"
            mainCaption="This is some text"
            isActive="isActive"
            useButton=true>
</walkthrough>
```

## Usage Example 2 - transparency using transclude option

```html
<walkthrough is-active="isActive" walkthrough-type="transparency">
  <img src="images/ImageTutorialExample.png" style="height: 100vh; width: 100%;">
</walkthrough>
```

## Usage Example 3 - tip type walkthrough

```html
<walkthrough
            walkthroughType="tip"
            icon="images/myLogo.png"
            tipIconLocation="FRONT"
            tipLocation="TOP"
            mainCaption="This is some text"
            tipColor="BLACK"
            isActive="isActive"
            useButton=true>
</walkthrough>
```


## Directive Attributes

- `isActive` (mandatory) - Any walkthrough type. Bound element controls display the directive. Set 'true' to bound element in order to display.
- `walkthroughType` (mandatory) - Any walkthrough type. Specifies what type of walkthrough to display. Currently supported are 'transparency' and 'tip' types
- `focusElementId` (optional) - Any walkthrough type. ID of DOM element we want to give focus to, without it all screen will be grayed out
- `isRound` (optional) - Any walkthrough type. Set to 'true' if you want the focused area to be round, otherwise it will be square set to the size of the DOM element
- `hasGlow` (optional) - Any walkthrough type. Set to 'true' if you want the focused area to have a glow around it
- `icon` (optional) - Any walkthrough type. If set to any of the predefined values ("single_tap", "double_tap", "swipe_down", "swipe_left", "swipe_right", "swipe_up"), in such case the icon will be bound to focus element (if exists), make sure to add 'ng-walkthrough.tap_icons.js' following instructions above. any other icon can be used and will be loaded from supplied folder
- `mainCaption` (optional) - Any walkthrough type. This is the text that will be displayed in the walk-through. Text can be formatted
- `useButton` (optional) - Any walkthrough type. set to 'true' you want a button displayed that most be clicked in order to close walkthrough, otherwise clicking anywhere while walkthrough displayed will close it
- `iconPaddingLeft` (optional) - Any walkthrough type. Add padding to the icon from the left in percentage
- `iconPaddingTop` (optional) - Any walkthrough type. Add padding to the icon from the top in pixels
- `tipIconLocation` (optional) - For tip walkthrough. In case there is an overlap between the tip text box and the tip icon you can define here which is on top. Either "FRONT" or "BACK"
- `forceCaptionLocation` (optional) - Any walkthrough type. Set caption location at the top of screen or closer to bottom. Acceptable values: "TOP" or "BOTTOM"
- `tipColor` (optional) - For tip walkthrough. Define the tip textbox background color. Currently supports "BLACK" or "WHITE" values
- `isBindClickEventToBody` (optional) - Any walkthrough type. If 'use-botton' is not set to true, then any this will bind the click events to the body to capture events outside walkthrough, for example: ionic header
- `onWalkthroughShow` (optional) - Any walkthrough type. Bind method to be called when walkthrough is displayed
- `onWalkthroughHide` (optional) - Any walkthrough type. Bind method to be called when walkthrough is hidden
- `textPosition` (optional) - Pixels from top to place the text

## License

As AngularJS itself, this module is released under the permissive [MIT license](http://revolunet.mit-license.org). Your contributions are always welcome.
