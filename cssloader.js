/**
 * Load stylesheets
 * stylesheets is an array of stylsheets to add
 * settings are options like force no cache which uses random number in name
 */
var cssloader = {}; // TODO check if variable was already instantiated

/**
 * Globals
 */
cssloader._g = {};
cssloader._g.settings = {
	defaultMedia: "screen",
	devMode: false
};
// Variable to hold all loaded stylesheets
cssloader._g.loadedSheets = [];
/**
 * Require one or many stylesheets
 * @param stylesheets two types available:
 * 1. Advanced: array of objects like [{href: "url_to_stylesheet/sheet.css", media: "screen"}, {href: "another.css", media: "print"}]
 * 2. Simple: a comma separated string like "url_to_stylesheet/sheet.css,another.css"
 * @param settings are passed to handle things like a different media type defaults or using dev mode to console on load
 * {
 *		defaultMedia: "screen",
 *		devMode: false
 * }
 */
cssloader.require = function(stylesheets,settings){
    var cssloader = this;
    // Extend settings
    cssloader._g.settings = cssloader._h.extend(cssloader._g.settings,settings);

    // Type of passed stylesheets
    var stylesheetsFormat = ( typeof stylesheets === "string" ? "simple" : "advanced" );

    // Get the array depending on format
    var stylesheetsArr = ( stylesheetsFormat === "simple" ? stylesheets.split(",") : stylesheets );

    // If there are no loaded sheets yet scan page for existing stylesheets included manually
    if (!cssloader._g.loadedSheets.length) {
        cssloader._g.loadedSheets = cssloader._h.getExistingPageSheets();
    }

	cssloader._h.loadSheets(stylesheetsArr,stylesheetsFormat);
};
cssloader.load = function(params) {
	// Type of passed stylesheets
	var stylesheetsFormat = ( typeof params.stylesheets === "string" ? "simple" : "advanced" );

	// Get the array depending on format
	var stylesheetsArr = ( stylesheetsFormat === "simple" ? params.stylesheets.split(",") : params.stylesheets );

	var appendedSheets = cssloader._h.appendSheets(stylesheetsArr,stylesheetsFormat);
	console.log('zz:',appendedSheets);
};
/**
 * PRIVATE HELPERS THAT DO NOT NEED TO BE EXPOSED TO PUBLIC
 */
cssloader._h = {};
cssloader._h.ajax = function(url, method, callback, params = null) {
	var obj;
	try {
		obj = new XMLHttpRequest();
	} catch(e){
		try {
			obj = new ActiveXObject("Msxml2.XMLHTTP");
		} catch(e) {
			try {
				obj = new ActiveXObject("Microsoft.XMLHTTP");
			} catch(e) {
				alert("Your browser does not support Ajax.");
				return false;
			}
		}
	}
	obj.onreadystatechange = function() {
		if(obj.readyState == 4) {
			callback(obj.responseText);
		}
	}
	obj.open(method, url, true);
	obj.send(params);
	return obj.responseText;
}
/**
 * Use special callback loop to make sure a stylesheet has been loaded before we continue to next
 * @param stylesheetsArr array of stylesheets
 * @param stylesheetsFormat the format of stylesheets array
 */
cssloader._h.loadSheets = function(stylesheetsArr,stylesheetsFormat) {
	var x = 0;
	var loopArray = function(arr) {
		customAlert(arr[x],function(){
			// set x to next item
			x++;

			// any more items in array? continue loop
			if(x < arr.length) {
				loopArray(arr);
			}
		});
	}

	function customAlert(item,callback) {
		// Set href depending on format
		var href = (stylesheetsFormat === "simple" ? item : item["href"]);
		href = cssloader._h.getHref(href);
		// Set media depending on format
		var media = (stylesheetsFormat === "simple" ? cssloader._g.settings.defaultMedia : item["media"]);

		// Make sure it has not already been loaded in page
		if(cssloader._h.hasNotBeenLoaded(href,cssloader._g.loadedSheets)) {
			var loadStylesheet = cssloader._h.loadCSS( href, null, media );
			cssloader._h.onloadCSS( loadStylesheet, function(theSheet) {
				if (cssloader._g.settings.devMode) console.log( "Stylesheet "+ theSheet.href +" has been loaded." );
				cssloader._g.loadedSheets.push(theSheet.href);
				// do callback when ready
				callback();
			});
		}
		// Handle if it's already loaded
		else {
			if (cssloader._g.settings.devMode) console.log("Stylesheet " + href + " could not be loaded as it's already loaded");
			// do callback when ready
			callback();
		}
	}
	loopArray(stylesheetsArr);
};

cssloader._h.appendSheets = function(stylesheetsArr,stylesheetsFormat) {
	var x = 0;
	var appendedSheets = "";
	var loopArray = function(arr,appendedSheets) {
		customAlert(arr[x],function(obj){
			// set x to next item
			appendedSheets += obj;
			x++;

			// any more items in array? continue loop
			if(x < arr.length) {
				loopArray(arr);
			}
			if (x == arr.length) {
				console.log("SHAZAM",appendedSheets);
			}
		});
	}

	function customAlert(item,callback) {
		var href = (stylesheetsFormat === "simple" ? item : item["href"]);
		href = cssloader._h.getHref(href);

		// Make sure it has not already been loaded in page
		if(cssloader._h.hasNotBeenLoaded(href,cssloader._g.loadedSheets)) {
			cssloader._h.ajax(href,"get",function(obj){
				//console.log(obj);
				callback(obj);
			});
			//
		}
		// Handle if it's already loaded
		else {
			if (cssloader._g.settings.devMode) console.log("Stylesheet " + href + " could not be loaded as it's already loaded");
			// do callback when ready
			callback();
		}
	}
	loopArray(stylesheetsArr,appendedSheets);
	return appendedSheets;
};

cssloader._h.extend = function(){
    for(var i=1; i<arguments.length; i++)
        for(var key in arguments[i])
            if(arguments[i].hasOwnProperty(key))
                arguments[0][key] = arguments[i][key];
    return arguments[0];
};

/**
 * Get href depending on the current url and the passed in url
 * @param href examples "/css/style.css" or "style.css" or "../../css/style.css" etc
 * @returns {*}
 */
cssloader._h.getHref = function(href) {
	// get the base url
	var pathname = window.location.pathname.substring(0,window.location.pathname.lastIndexOf('/')+1);
	var baseurl = window.location.href.substring(0,location.href.lastIndexOf('/')+1).replace(pathname,"");
	// if baseurl does not end on / add it
	pathname = ( pathname.substr(pathname.length - 1) === "/" ? pathname : pathname + "/" );
	// handle relative paths with ../ TODO test with multiple ../ levels
	if (href.substr(0,3) === "../") {
		var relativePaths = href.split("../");
		if (relativePaths.length > 1) {
			var segmentArr = pathname.split("/");
			segmentArr.pop();
			for (var x = 1; x < segmentArr.length; x++) {
				segmentArr.pop();
			}
			pathname = segmentArr.join("/")+"/";
		}
		href = baseurl + pathname + href.split("../").join("");
	}
	// handle absolute paths
	else if ( href.charAt(0) === "/") {
		href = baseurl + href;
	}
	// handle relative path
	else {
		href = baseurl + pathname + href;
	}
	return href;
}
/**
 * Check if sheet is in sheets
 */
cssloader._h.hasNotBeenLoaded = function(sheet, sheets) {
    return (sheets.indexOf(sheet) === -1);
};
/**
 * Get all stylesheets on page as array of hrefs
 */
cssloader._h.getExistingPageSheets = function() {
    // Get current page stylesheets that already exist, non dynamically loaded
    var allSheetsArr = document.head.getElementsByTagName("link");
    var arrayOfHrefs = [];
    for (var i = 0; i < allSheetsArr.length; i++) {
        arrayOfHrefs.push( allSheetsArr[i].href);
    };
    return arrayOfHrefs;
};
/*! loadCSS: load a CSS file asynchronously. [c]2016 @scottjehl, Filament Group, Inc. Licensed MIT
 https://github.com/filamentgroup/loadCSS
 */
cssloader._h.loadCSS = function( href, before, media ){
    var w = window;
    // Arguments explained:
    // `href` [REQUIRED] is the URL for your CSS file.
    // `before` [OPTIONAL] is the element the script should use as a reference for injecting our stylesheet <link> before
    // By default, loadCSS attempts to inject the link after the last stylesheet or script in the DOM. However, you might desire a more specific location in your document.
    // `media` [OPTIONAL] is the media type or query of the stylesheet. By default it will be 'all'
    var doc = w.document;
    var ss = doc.createElement( "link" );
    var ref;
    if( before ){
        ref = before;
    }
    else {
        var refs = ( doc.body || doc.getElementsByTagName( "head" )[ 0 ] ).childNodes;
        ref = refs[ refs.length - 1];
    }

    var sheets = doc.styleSheets;
    ss.rel = "stylesheet";
    ss.href = href;
    // temporarily set media to something inapplicable to ensure it'll fetch without blocking render
    ss.media = "only x";

    // wait until body is defined before injecting link. This ensures a non-blocking load in IE11.
    function ready( cb ){
        if( doc.body ){
            return cb();
        }
        setTimeout(function(){
            ready( cb );
        });
    }
    // Inject link
    // Note: the ternary preserves the existing behavior of "before" argument, but we could choose to change the argument to "after" in a later release and standardize on ref.nextSibling for all refs
    // Note: `insertBefore` is used instead of `appendChild`, for safety re: http://www.paulirish.com/2011/surefire-dom-element-insertion/
    ready( function(){
        ref.parentNode.insertBefore( ss, ( before ? ref : ref.nextSibling ) );
    });
    // A method (exposed on return object for external use) that mimics onload by polling document.styleSheets until it includes the new sheet.
    var onloadcssdefined = function( cb ){
        var resolvedHref = ss.href;
        var i = sheets.length;
        while( i-- ){
            if( sheets[ i ].href === resolvedHref ){
                return cb();
            }
        }
        setTimeout(function() {
            onloadcssdefined( cb );
        });
    };

    function loadCB(){
        if( ss.addEventListener ){
            ss.removeEventListener( "load", loadCB );
        }
        ss.media = media || "all";
    }

    // once loaded, set link's media back to `all` so that the stylesheet applies once it loads
    if( ss.addEventListener ){
        ss.addEventListener( "load", loadCB);
    }
    ss.onloadcssdefined = onloadcssdefined;
    onloadcssdefined( loadCB );
    return ss;
};
/*! onloadCSS: adds onload support for asynchronous stylesheets loaded with loadCSS. [c]2016 @zachleat, Filament Group, Inc. Licensed MIT */
/* global navigator */
/* exported onloadCSS */
cssloader._h.onloadCSS = function( ss, callback ) {
    var called;
    function newcb(){
        if( !called && callback ){
            called = true;
            callback.call( ss, ss );
        }
    }
    if( ss.addEventListener ){
        ss.addEventListener( "load", newcb );
    }
    if( ss.attachEvent ){
        ss.attachEvent( "onload", newcb );
    }

    // This code is for browsers that don’t support onload
    // No support for onload (it'll bind but never fire):
    //	* Android 4.3 (Samsung Galaxy S4, Browserstack)
    //	* Android 4.2 Browser (Samsung Galaxy SIII Mini GT-I8200L)
    //	* Android 2.3 (Pantech Burst P9070)

    // Weak inference targets Android < 4.4
    if( "isApplicationInstalled" in navigator && "onloadcssdefined" in ss ) {
        ss.onloadcssdefined( newcb );
    }
};
/**
 * When document is ready and loaded we can start
 */
(function(funcName, baseObj) {
	// The public function name defaults to window.docReady
	// but you can pass in your own object and own function name and those will be used
	// if you want to put them in a different namespace
	funcName = funcName || "docReady";
	baseObj = baseObj || window;
	var readyList = [];
	var readyFired = false;
	var readyEventHandlersInstalled = false;

	// call this when the document is ready
	// this function protects itself against being called more than once
	function ready() {
		if (!readyFired) {
			// this must be set to true before we start calling callbacks
			readyFired = true;
			for (var i = 0; i < readyList.length; i++) {
				// if a callback here happens to add new ready handlers,
				// the docReady() function will see that it already fired
				// and will schedule the callback to run right after
				// this event loop finishes so all handlers will still execute
				// in order and no new ones will be added to the readyList
				// while we are processing the list
				readyList[i].fn.call(window, readyList[i].ctx);
			}
			// allow any closures held by these functions to free
			readyList = [];
		}
	}

	function readyStateChange() {
		if ( document.readyState === "complete" ) {
			ready();
		}
	}

	// This is the one public interface
	// docReady(fn, context);
	// the context argument is optional - if present, it will be passed
	// as an argument to the callback
	baseObj[funcName] = function(callback, context) {
		// if ready has already fired, then just schedule the callback
		// to fire asynchronously, but right away
		if (readyFired) {
			setTimeout(function() {callback(context);}, 1);
			return;
		} else {
			// add the function and context to the list
			readyList.push({fn: callback, ctx: context});
		}
		// if document already ready to go, schedule the ready function to run
		if (document.readyState === "complete") {
			setTimeout(ready, 1);
		} else if (!readyEventHandlersInstalled) {
			// otherwise if we don't have event handlers installed, install them
			if (document.addEventListener) {
				// first choice is DOMContentLoaded event
				document.addEventListener("DOMContentLoaded", ready, false);
				// backup is window load event
				window.addEventListener("load", ready, false);
			} else {
				// must be IE
				document.attachEvent("onreadystatechange", readyStateChange);
				window.attachEvent("onload", ready);
			}
			readyEventHandlersInstalled = true;
		}
	}
})("docReady", window);