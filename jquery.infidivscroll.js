(function($) {

	var settings;
	
	var privates = {
		debug : function(value) {
			if (settings.debug) {
				console.log('DEBUG Infidivscroll: ' + value);
			};
		},
		doCalculation: function(obj) {
			privates.debug('Doing calculation');
			var calcDiv = $(obj);
			var scrolledToPosition = calcDiv[0].scrollHeight - calcDiv.scrollTop() <= (calcDiv.outerHeight() + settings.scrollPadding);
			return scrolledToPosition;
		},
		checkScrollPosition: function() {
			if (!privates.paused && privates.doCalculation(this)) {

					privates.paused = true;
					privates.setLoadingElm();
					privates.validateAjaxSettings();
			};
		},
		setLoadingElm: function() {

			if (settings.loadingElm === undefined) {
				settings.loadingElm = $('<div id="infidivscroll-loading"><img alt="Loading..." src="ajax-loader.gif" />' + settings.loadingText + '</div>')
			};

			$(settings.element).append(settings.loadingElm);
		},
		removeLoadingElm: function() {
			settings.loadingElm.fadeOut('slow').remove();
		},
		validateAjaxSettings: function() {
			if (settings.callback !== undefined && typeof(settings.callback) === 'function') {
				settings.callback();
			}
			else if (settings.url !== undefined && typeof(settings.url) === 'string') {
				if (privates.currentXhr === undefined) {
					privates.doAjaxCall();
				}
				
				privates.debug('XHR in use');
			}
		},
		doAjaxCall: function() {
			if (settings.ajaxType !== undefined && typeof(settings.ajaxType) === 'string') {
				type = settings.ajaxType;
			};
			
			privates.currentXhr = $.ajax({
				url: settings.url,
				type: type,
				data: settings.ajaxData,
			  	success: function(data){
					if (settings.ajaxCallback !== '' && typeof(settings.ajaxCallback) === 'function') {
						settings.ajaxCallback(data);
						privates.currentXhr = undefined;
						privates.removeLoadingElm();
						privates.paused = false;
					};
			  	},
			  	error: function(jqXHR, textStatus, errorThrown) {
			  		publics.destroy();
			  		privates.debug(errorThrown);
			  		privates.removeLoadingElm();
			  	}
			});
		},
		currentXhr: undefined,
		paused: false,
		
	};

	var publics = {
		init : function(options) {
			settings = $.extend({
				'element'		: this,
				'url'			: undefined,
				'ajaxType'		: 'GET',
				'ajaxData'		: undefined,
				'ajaxCallback'	: undefined,
				'loadingText'	: '&nbsp;loading...',
				'loadingElm'	: undefined,
				'debug'			: false,
				'scrollPadding'	: 150,
			}, options);

			return this.each(function(){
				settings.element = this;
				$(this).bind('smartscroll.infidivscroll', privates.checkScrollPosition);
			});
	    },
	    bind : function() {
			this.bind('smartscroll', function() {
				privates.checkScrollPosition;
			});
	    },
		destroy: function() {
			return $(this).each(function(){
			    $(this).unbind('.infidivscroll');
			});
		},
	};

	$.fn.infidivscroll = function(method) {
		// Method calling logic
		if ( publics[method] ) {
			return publics[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
	      	return publics.init.apply( this, arguments );
		} else {
			$.error('Method ' +  method + ' does not exist on jQuery.infidivscroll');
		}
	};

	/* 
	* smartscroll: debounced scroll event for jQuery *
	* https://github.com/lukeshumard/smartscroll
	* based on smartresize by @louis_remi: https://github.com/lrbabe/jquery.smartresize.js *
	* Copyright 2011 Louis-Remi & lukeshumard * Licensed under the MIT license. *
	*/
	
	
	var event = $.event,
		scrollTimeout;

	event.special.smartscroll = {
		setup: function() {
		  $(this).bind( "scroll", event.special.smartscroll.handler );
		},
		teardown: function() {
		  $(this).unbind( "scroll", event.special.smartscroll.handler );
		},
		handler: function( event, execAsap ) {
		  // Save the context
		  var context = this,
		      args = arguments;

		  // set correct event type
		  event.type = "smartscroll";

		  if (scrollTimeout) { clearTimeout(scrollTimeout); }
		  scrollTimeout = setTimeout(function() {
		    jQuery.event.handle.apply( context, args );
		  }, execAsap === "execAsap"? 0 : 100);
		}
	};

	$.fn.smartscroll = function( fn ) {
		return fn ? this.bind( "smartscroll", fn ) : this.trigger( "smartscroll", ["execAsap"] );
	};

})(jQuery);