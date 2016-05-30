/*! Custom Funk Force 5 Code */

// handle return from impressum and datenschutz and scroll to specified #_section
$(function() {
    var hash = window.location.hash;
    if (hash.indexOf('_') < 0)
        return;

    hash = hash.replace('_', '');
    history.pushState("", document.title, window.location.pathname
        + window.location.search);

    setTimeout(function() {
        // scroll to the modified hash (copied form agency.js)
        $("html, body").stop().animate({
            scrollTop: $(hash).offset().top
        }, 1500, "easeInOutExpo");
    }, 500);
});

// scrollreveal
$(function() {
    window.sr = ScrollReveal({ reset: true, viewFactor: 0.4, viewOffset: { top: 50, right: 0, bottom: 0, left: 0 } });

    // default behavior
    sr.reveal(".sreveal");

    // taken from https://gist.github.com/gordonbrander/2230317
    var uniqueId = function() {
        return '_' + Math.random().toString(36).substr(2, 9);
    };

    // overwrite reveal behavior for .srgroup by assigning a unique id first
    var groups = $(".srgroup");
    for (var idx = 0; idx < groups.length; idx++) {
        var group = groups[idx];
        var id = group.id;

        if (!id) {
            id = uniqueId();
            group.id = id;
        }

        sr.reveal("#" + id + " .sreveal", 100);
    }

    sr.reveal("#repertoire .sreveal", {reset: false}, 25);
    sr.reveal("#contact .sreveal", {reset: false});
});

// remove info on date
$(function() {
    $("#info .event").each(function() {
        var $event = $(this);
        if (new Date() > new Date($event.attr("data-removeon")))
            $event.hide();
    });
});

// scroll to top button
$(function() {
    $(window).scroll(function() {
        var $backtotop = $("a.backtotop");
        if ($(this).scrollTop() > 100) {
            $backtotop.fadeIn();
        } else {
            $backtotop.fadeOut();
        }
    });
});

// Repertoire Setup
$(function() {
    $('#repertoire').find('button').click(function() {
        var moreText = "... mehr!";
        if ($(this).text().trim() == moreText) {
            $(this).text('weniger?');
        } else {
            $(this).text(moreText);
        }
    });
});

// add email + phone via js
$(function() {
    function reverse(s) {
        return s.split('').reverse().join('');
    }

    var mail = "ed.5ecrofknuf@tkatnok";
    var phone = "5008 479 361 94+";
    mail = reverse(mail);
    phone = reverse(phone);

    $(".contact-mail").attr('href', 'mailto:' + mail).text(mail);
    $(".contact-phone").attr('href', 'tel:' + phone.replace(/ /g,'')).text(phone);
});

///// PhotoSwipe Setup /////
$(function() {
    var initPhotoSwipeFromDOM = function(gallerySelector) {

        // parse slide data (url, title, size ...) from DOM elements
        // (children of gallerySelector)
        var parseThumbnailElements = function(el) {
            var thumbElements = $(el).find('figure'),
                numNodes = thumbElements.length,
                items = [],
                figureEl,
                linkEl,
                size,
                item;

            for(var i = 0; i < numNodes; i++) {

                figureEl = thumbElements[i]; // <figure> element

                // include only element nodes
                if(figureEl.nodeType !== 1) {
                    continue;
                }

                linkEl = figureEl.children[0]; // <a> element

                size = linkEl.getAttribute('data-size').split('x');

                // create slide object
                item = {
                    src: linkEl.getAttribute('href'),
                    w: parseInt(size[0], 10),
                    h: parseInt(size[1], 10),
                    author: linkEl.getAttribute('data-author')
                };



                if(figureEl.children.length > 1) {
                    // <figcaption> content
                    item.title = figureEl.children[1].innerHTML;
                }

                if(linkEl.children.length > 0) {
                    // <img> thumbnail element, retrieving thumbnail url
                    item.msrc = linkEl.children[0].getAttribute('src');
                }

                item.el = figureEl; // save link to element for getThumbBoundsFn
                items.push(item);
            }

            return items;
        };

        // find nearest parent element
        var closest = function closest(el, fn) {
            return el && ( fn(el) ? el : closest(el.parentNode, fn) );
        };

        // triggers when user clicks on thumbnail
        var onThumbnailsClick = function(e) {
            e = e || window.event;
            e.preventDefault ? e.preventDefault() : e.returnValue = false;

            var eTarget = e.target || e.srcElement;

            // find root element of slide
            var clickedListItem = closest(eTarget, function(el) {
                return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
            });

            if(!clickedListItem) {
                return;
            }

            // find index of clicked item by looping through all child nodes
            // alternatively, you may define index via data- attribute
            var clickedGallery = clickedListItem.parentNode,
                childNodes = clickedListItem.parentNode.childNodes,
                numChildNodes = childNodes.length,
                nodeIndex = 0,
                index;

            for (var i = 0; i < numChildNodes; i++) {
                if(childNodes[i].nodeType !== 1) {
                    continue;
                }

                if(childNodes[i] === clickedListItem) {
                    index = nodeIndex;
                    break;
                }
                nodeIndex++;
            }



            if(index >= 0) {
                // open PhotoSwipe if valid index found
                openPhotoSwipe( index, clickedGallery );
            }
            return false;
        };

        // parse picture index and gallery index from URL (#&pid=1&gid=2)
        var photoswipeParseHash = function() {
            var hash = window.location.hash.substring(1),
                params = {};

            if(hash.length < 5) {
                return params;
            }

            var vars = hash.split('&');
            for (var i = 0; i < vars.length; i++) {
                if(!vars[i]) {
                    continue;
                }
                var pair = vars[i].split('=');
                if(pair.length < 2) {
                    continue;
                }
                params[pair[0]] = pair[1];
            }

            if(params.gid) {
                params.gid = parseInt(params.gid, 10);
            }

            return params;
        };

        var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
            var pswpElement = document.querySelectorAll('.pswp')[0],
                gallery,
                options,
                items;

            items = parseThumbnailElements(galleryElement);

            // define options (if needed)
            options = {

                // define gallery index (for URL)
                galleryUID: galleryElement.getAttribute('data-pswp-uid'),

                getThumbBoundsFn: function(index) {
                    // See Options -> getThumbBoundsFn section of documentation for more info
                    var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                        pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                        rect = thumbnail.getBoundingClientRect();

                    return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
                },

                addCaptionHTMLFn: function(item, captionEl, isFake) {
                    if(!item.title) {
                        captionEl.children[0].innerText = '';
                        return false;
                    }
                    captionEl.children[0].innerHTML = item.title +  '<br/><small>Photo: ' + item.author + '</small>';
                    return true;
                }
            };

            // PhotoSwipe opened from URL
            if(fromURL) {
                if(options.galleryPIDs) {
                    // parse real index when custom PIDs are used
                    // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
                    for(var j = 0; j < items.length; j++) {
                        if(items[j].pid == index) {
                            options.index = j;
                            break;
                        }
                    }
                } else {
                    // in URL indexes start from 1
                    options.index = parseInt(index, 10) - 1;
                }
            } else {
                options.index = parseInt(index, 10);
            }

            // exit if index not found
            if( isNaN(options.index) ) {
                return;
            }

            if(disableAnimation) {
                options.showAnimationDuration = 0;
            }

            // Pass data to PhotoSwipe and initialize it
            gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
            gallery.init();
        };

        // loop through all gallery elements and bind events
        var galleryElements = document.querySelectorAll( gallerySelector );

        for(var i = 0, l = galleryElements.length; i < l; i++) {
            galleryElements[i].setAttribute('data-pswp-uid', i+1);
            galleryElements[i].onclick = onThumbnailsClick;
        }

        // Parse URL and open gallery if it contains #&pid=3&gid=1
        var hashData = photoswipeParseHash();
        if(hashData.pid && hashData.gid) {
            openPhotoSwipe( hashData.pid ,  galleryElements[ hashData.gid - 1 ], true, true );
        }
    };

    // execute above function
    initPhotoSwipeFromDOM('.gallery');
});