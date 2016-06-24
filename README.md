# showcase-marketing
Marketing widgets for the Showcase family of products.

## Usage

#### Get a container element
The app will be inserted into this DOM element.
```
var container = document.getElementById('root');
```

#### Configure your settings
Default values will be used if the options are not set.
```
var options = {
    titleText : 'Your title Here',
    subtitleText: 'Your sub here',
    buttonText: 'click me',
    showLoadingAnimation: false
};
```

#### Render the widget
Call the widget's `render()` method with the container element and options.
```
var widget = adWidget.render( container , options );
```

#### Add event handler for 'showPreview' event
The `showPreview` event is fired when the user previews their ad.
```
widget.on('showPreview', function() {
    console.log('wow, my ad looks great!');
});
```
