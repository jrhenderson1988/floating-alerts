# Floating Alerts

Floating Alerts is a jQuery plugin for creating simple, animated alerts that slide into view from off screen. There are a number of ways that alerts can be created, including:

- Creating alerts programmatically using the `createAlert(messages, classes)` method.
- Executing alerts based upon existing HTML in the body.
- Watching the body for newly created matching elements, that are automatically executed.

## Usage

The plugin is really easy to use. Just include jQuery, include the plugin file and initialise the plugin like this:

    <script src="https://code.jquery.com/jquery-3.1.0.min.js" type="text/javascript"></script>
    <script src="/path/to/floating-alerts.js" type="text/javascript"></script>

    <script>
        $.floatingAlerts();
    </script>

### Options

There are some options you can pass to the plugin to configure it's functionality:

Option              | Type              | Default           | Description
---                 |---                |---                |---
listenForNew        | Boolean           | `true`            | Listen for newly created elements that match the target class and execute them as alerts
targetClass         | String            | `floating-alert`  | The class the plugin should consider to be an alert
alertTemplate       | String            | `<div class="%targetclass% %extraclasses%"><ul class="%targetclass%-messages">%messages%</ul></div>` | The surrounding alert template. The `%targetclass%` will be replaced with the *targetClass* value, `%extraclasses%` will be replaced with extra classes passed to the `createAlert(messages, extraClasses)` method and `%messages%` will be replaced with the generated HTML for the messages (Using the *messagesTemplate* as a template).
messageTemplate     | String            | `<li class="%targetclass%-message">%message%</li>` | The HTML template for each message. `%targetclass%` will be replaced with the *targetClass* value and `%message%` will be replaced with the message content.
animationDuration   | Integer           | `200`             | The duration of the alert animation, the smaller the number, the quicker the animation.
animationEasing     | String/Function   | `swing`           | The animation easing function. This is passed to `jQuery.animate()` so it accepts anything that it accepts.
clickToDismiss      | Boolean           | `true`            | Whether the alert should be dismissed when it's clicked.
visibleDuration     | Integer           | `5000`            | The number of milliseconds that the alert is visible before it's automatically dismissed.
zIndex              | Integer           | `1000000`         | The *z-index* CSS value of the alert.
animateHorizontal   | Boolean           | `true`            | Whether the alert should animate in horizontally (From the left or right).
animateVertical     | Boolean           | `false`           | Whether the alert should animate in vertically (From the top or bottom).
fromLeft            | Boolean           | `false`           | Whether the alert should be anchored to the left. When `false` the alert is anchored to the right.
fromTop             | Boolean           | `false`           | Whether the alert should be anchored to the top. When `false` the alert is anchored to the bottom.
horizontalGap       | Integer           | `0`               | The number of pixels the alert is offset from the left/right of the window.
verticalGap         | Integer           | `0`               | The number of pixels the alert is offset from the top/bottom of the window.

### Examples

TODO
