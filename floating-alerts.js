;(function($) {
    var instance = null;
    var defaults = {
        listenForNew: true,
        targetClass: 'floating-alert',
        alertTemplate: '<div class="%targetclass% %extraclasses%"><ul class="%targetclass%-messages">%messages%</ul></div>',
        messageTemplate: '<li class="%targetclass%-message">%message%</li>',
        animationDuration: 200,
        animationEasing: 'swing',
        clickToDismiss: true,
        visibleDuration: 5000,
        zIndex: 1000000,

        animateHorizontal: true,        // When true, we animate horizontally from the left or right
        animateVertical: false,         // When true, we animate vertically from the top or bottom
        fromLeft: false,                 // When true, the alert is anchored to the left. When false it's anchored to the right
        fromTop: false,                  // When true, the alert is anchored to the top. When false it's anchored to the bottom
        horizontalGap: 0,               // The size of the gap in pixels of the alert from the side of the window
        verticalGap: 0                  // The size of the gap in pixels of the alert from the top or bottom of the window
    };

    $.extend({
        floatingAlerts: function(options) {
            if (!instance) {
                instance = {
                    /**
                     * Entry point into the plugin. This method is called upon the first instantiation.
                     */
                    init: function () {
                        this._defaults = defaults;
                        this._options = options;
                        this.settings = $.extend({}, defaults, options);
                        this.body = $('body');

                        this.createObserver();
                        this.executeExistingAlerts();
                        this.createAlert(['Test alert'], 'test');
                    },
                    /**
                     * Create an alert with a set of messages and any extra classes that need to be added onto it.
                     *
                     * @param messages
                     * @param extraClasses
                     */
                    createAlert: function(messages, extraClasses) {
                        // Compile the template to generate the HTML for the alert.
                        var html = this.compileTemplate(messages, extraClasses)

                        // Create a jQuery wrapped element for the alert.
                        var alert = $(html);

                        // Add a class that we can listen for in the observer so we can ignore it there and not let the
                        // observer take control.
                        alert.addClass('observer-should-ignore');

                        // Append the alert to the body.
                        this.body.append(alert);

                        // Trigger the alert execution.
                        this.executeAlert(alert);
                    },
                    /**
                     * Compile the template using the alertTemplate and messageTemplate settings. If no messages are
                     * provided then an empty string is returned.
                     *
                     * @param messages
                     * @param extraClasses
                     * @returns {string}
                     */
                    compileTemplate: function(messages, extraClasses) {
                        // Ensure messages is an object and that extraClasses is a string.
                        messages = typeof messages !== 'object' ? [messages] : messages;
                        extraClasses = typeof extraClasses !== 'string' ? '' : extraClasses;

                        // If there are no messages, then we don't need to compile anything, return an empty string.
                        if (messages.length <= 0) {
                            return '';
                        }

                        var messagesHtml = '';

                        // Compile each of the messages first by going through each message, and replacing all the tags
                        // in the messageTemplate with the relevant values and sticking them all together.
                        for (var i in messages) {
                            var message = messages[i];
                            var replacements = {
                                message: message,
                                targetclass: this.settings.targetClass
                            };

                            var messageHtml = this.settings.messageTemplate;
                            for (var tag in replacements) {
                                var replacement = replacements[tag];
                                messageHtml = messageHtml.split('%' + tag + '%').join(replacement);
                            }

                            messagesHtml += messageHtml;
                        }

                        // Now we can build the alert HTMl by replacing all the relevant tags as usual and replacing the
                        // messages we've just compiled into it too.
                        var alertHtml = this.settings.alertTemplate;
                        var replacements = {
                            targetclass: this.settings.targetClass,
                            extraclasses: extraClasses,
                            messages: messagesHtml,
                        };

                        for (var tag in replacements) {
                            var replacement = replacements[tag];
                            alertHtml = alertHtml.split('%' + tag + '%').join(replacement);
                        }

                        return alertHtml;
                    },
                    /**
                     * Accept an alert that has already been added to the body (Either by the createAlert function or by
                     * watching for alerts added to the body). Position the alert accordingly, animate it in, and apply
                     * any events needed to it.
                     *
                     * @param alert
                     */
                    executeAlert: function(alert) {
                        // Ensure the alert is hidden as soon as possible, before it is repositioned.
                        alert.hide();

                        // Get the outer width of the alert and define some variables to help with the functionality
                        var readyToDismiss = false;
                        var mouseOverAlert = false;
                        var outerWidth = alert.outerWidth();
                        var outerHeight = alert.outerHeight();

                        // Store this in variable _this to make it accessible inside closures that provide their own this
                        var _this = this;

                        // Work out the horizontal positioning properties. Pull the gap from the settings, work out the
                        // initial horizontal pixel value to use when positioning the alert off screen (Regardless of if
                        // it's left or right) and work out the property (left/right) to use.
                        var horizontalGap = typeof this.settings.horizontalGap !== 'undefined' ? this.settings.horizontalGap : 0;
                        var horizontalPosition = this.settings.animateHorizontal ? -(outerWidth + horizontalGap) + 'px' : horizontalGap;
                        var horizontalProperty = this.settings.fromLeft ? 'left' : 'right';

                        // Work out the same properties as specified above, but for the vertical positioning. The
                        // vertical gap, the vertical pixel value to position off screen and the property
                        // (top/bottom) to use.
                        var verticalGap = typeof this.settings.verticalGap !== 'undefined' ? this.settings.verticalGap : 0;
                        var verticalPosition = this.settings.animateVertical ? -(outerHeight + verticalGap) + 'px' : verticalGap;
                        var verticalProperty = this.settings.fromTop ? 'top' : 'bottom';

                        // Function that will deal with dismissing the alert
                        var dismiss = function() {
                            if (readyToDismiss && !mouseOverAlert) {
                                var dismissedCss = {};
                                dismissedCss[horizontalProperty] = horizontalPosition;
                                dismissedCss[verticalProperty] = verticalPosition;

                                // Animate the alert then hide and remove it when the animation is complete.
                                alert.animate(
                                    dismissedCss,
                                    _this.settings.animationDuration,
                                    _this.settings.animationEasing,
                                    function() {
                                        alert.hide().remove();
                                    }
                                );
                            }
                        };


                        // Use the calculations we've made to position the alert off screen initially and apply any
                        // other relevant CSS (Fixed position and the z-index provided by the settings).
                        var initialCss = {
                            'position': 'fixed',
                            'z-index': typeof this.settings.zIndex !== 'undefined' ? this.settings.zIndex : 1000000
                        };
                        initialCss[horizontalProperty] = horizontalPosition;
                        initialCss[verticalProperty] = verticalPosition;

                        // Display the alert once it's positioned off screen.
                        alert.css(initialCss).show();

                        // The animation CSS should essentially be a position of horizontalGap, verticalGap (or 0, 0)
                        // and the properties we should use have already been determined.
                        var animationCss = {};
                        animationCss[horizontalProperty] = horizontalGap;
                        animationCss[verticalProperty] = verticalGap;

                        // Animate the alert into view.
                        alert.animate(animationCss, this.settings.animationDuration, this.settings.animationEasing);

                        // If clickToDismiss is enabled, add a click handler to the alert to force it to be dismissed.
                        if (_this.settings.clickToDismiss) {
                            alert.click(function () {
                                mouseOverAlert = false;
                                readyToDismiss = true;
                                dismiss();
                            });
                        }

                        // Add a mouseover handler to the alert to set the mouseOverAlert state variable to true. We use
                        // this to determine when we should dismiss the alert.
                        alert.mouseover(function() {
                            mouseOverAlert = true;
                        })

                        // Add a mouseout handler to the alert to set the mouseOverAlert state variable to false. We
                        // also attempt to trigger the alert dismissal. If the visibleDuration has elapsed, the alert
                        // will be dismissed successfully on mouseout at this point.
                        alert.mouseout(function() {
                            mouseOverAlert = false;
                            dismiss();
                        });

                        // Wait for settings.visibleDuration milliseconds to elapse, set readyToDismiss to true and
                        // trigger the dismiss method, which will (if the mouse is not over the alert) dismiss it.
                        setTimeout(function() {
                            readyToDismiss = true;
                            dismiss();
                        }, this.settings.visibleDuration);
                    },
                    /**
                     * Handle the event that a new alert was created and added to the body. Accepts a jQuery wrapped DOM
                     * element that represents the element. Generally, this handler will simply action the positioning
                     * and animation of the alert.
                     *
                     * @param element
                     */
                    handleAlertCreated: function(alert) {
                        this.executeAlert(alert);
                    },
                    /**
                     * Tell whether or not we're able to watch the body for new elements created, based on the
                     * listenForNew setting and whether or not the MutationObserver and HTMLElement are supported.
                     *
                     * @returns {boolean}
                     */
                    canWatchBody: function() {
                        return this.settings.listenForNew && window.MutationObserver && typeof HTMLElement !== 'undefined';
                    },
                    /**
                     * Create a mutation observer that watches the body for new alert elements (Elements that have the
                     * class targetClass) being created.
                     *
                     * @returns {boolean}
                     */
                    createObserver: function() {
                        // If the listenForNew setting equates to false, or the MutationObserver/HTMLElement are not
                        // supported, then bail out of this method.
                        if (!this.canWatchBody()) {
                            return false;
                        }

                        var _this = this;

                        // Create a mutation observer that checks if any newly created DOM elements have the class
                        // targetClass. If they do then the handleAlertCreated() method is called, passing through the
                        // jQuery wrapped DOM element.
                        var observer = new MutationObserver(function(mutations) {
                            mutations.forEach(function(mutation) {
                                if (mutation.addedNodes) {
                                    for (var i in mutation.addedNodes) {
                                        var node = mutation.addedNodes[i];
                                        if (node instanceof HTMLElement) {
                                            var jqElement = $(node);
                                            if (jqElement.hasClass(_this.settings.targetClass) && !jqElement.hasClass('observer-should-ignore')) {
                                                _this.handleAlertCreated(jqElement);
                                            }
                                        }
                                    }
                                }
                            });
                        });

                        var config = {
                            childList: true,
                            attributes: true,
                            characterData: true,
                        };

                        observer.observe(this.body[0], config);
                    },
                    /**
                     * Find any existing alerts in the body and execute them.
                     */
                    executeExistingAlerts: function() {
                        var _this = this;
                        this.body.find('.' + this.settings.targetClass).each(function() {
                            _this.executeAlert($(this));
                        });
                    }
                };

                instance.init();
            }

            return instance;
        }
    });
})(jQuery);