import Ember from 'ember';

const {
	run,
	observer,
	on,
	isEmpty,
	$,
	Handlebars: {
		SafeString
	}
} = Ember;

export default Ember.Component.extend({

	attributeBindings: ['title'],

	/**
	 * Set how tooltips should be activated and closed.
	 * Default: 'hover'
	 * Options: [hover, click]
	 * @type {String}
	 */
	triggerEvent: 'hover',

	tooltipsterOptions: [
		'animation',
		'arrow',
		'arrowColor',
		'content',
		'contentAsHTML',
		'debug',
		'delay',
		'interactive',
		'minWidth',
		'maxWidth',
		'offsetX',
		'offsetY',
		'position',
		'positionTracker',
		'speed',
		'timer',
		'theme',
		'updateAnimation',
		'autoClose',
		'icon',
		'iconCloning',
		'iconDesktop',
		'iconTouch',
		'iconTheme'
	],

	_initializeTooltipster: on('didInsertElement', function() {
		let options = {};
		let content = this.get('content') || this.get('title');
    
		this.get('tooltipsterOptions').forEach((option) => {
			if (!isEmpty(this.get(option))) {
				options[option] = this.get(option);
			}
		});

		// Handle SafeString
		if (content instanceof SafeString) {
			options.content = content.toString();
		}

		options.trigger = this.get('triggerEvent');

		['functionInit', 'functionBefore', 'functionReady', 'functionAfter', 'positionTrackerCallback'].forEach(fn => {
			options[fn] = $.proxy(this[fn], this);
		});

		this.$().tooltipster(options);
	}),

	_onContentDidChange: observer('content', 'title', function() {
		run.scheduleOnce('afterRender', this, () => {
			let content = this.get('content') || this.get('title');
			if (content instanceof SafeString) {
				content = content.toString();
			}
			this.$().tooltipster('content', content);
		});
	}),

	/**
	 * Hide tooltip manually.
	 * Send action `onTooltipHide` when the tooltip is fully closed.
	 *
	 * Please note that if the show/hide action is somehow cancelled before it has completed its animation,
	 * the callback function will never be called.
	 */
	_onTooltipHide: observer('hide', function() {
		const hide = this.get('hide');
		if (hide) {
			run.once(this, () => {
				this.$().tooltipster('hide', () => {
					this.sendAction('onTooltipHide');
				});
			});
		}
	}),

	/**
	 * Show tooltip manually.
	 * Send action `onTooltipShow` when the tooltip is fully open.
	 *
	 * Please note that if the show/hide action is somehow cancelled before it has completed its animation,
	 * the callback function will never be called.
	 */
	_onTooltipShow: observer('show', function() {
		const show = this.get('show');
		if (show) {
			run.once(this, () => {
				this.$().tooltipster('show', () => {
					this.sendAction('onTooltipShow');
				});
			});
		}
	}),

	_destroyTooltipster: on('willDestroyElement', function() {
		if (this.$().data('tooltipster-ns')) {
			this.$().tooltipster('destroy');
		}
		this.$().off();
	}),

	/**
	 * Send action `open` when the tooltip and its contents have been added to the DOM
	 *
	 * @method functionBefore
	 */
	functionReady(origin, tooltip) {
		this.sendAction('open', tooltip);
	},

	/**
	 * Send action `close` once the tooltip has been closed and removed from the DOM
	 *
	 * @method functionBefore
	 */
	functionAfter( /*origin*/ ) {
		this.sendAction('close');
	}
});
