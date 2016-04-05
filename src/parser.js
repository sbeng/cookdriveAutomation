var page = require('webpage').create(),
    system = require('system'),
    colors = require('colors'),
    apiURL;

if (system.args.length < 2) {
    console.log(colors.red('Usage: main.js <API URL>'));
    phantom.exit(1);
} else if (isUrl(system.args[1])) {
    apiURL = system.args[1];
} else {
    console.log(colors.red('Please enter valid URL, like http://name.damain/api-url'));
    phantom.exit(1);
}

var address = 'http://cookdrive.com.ua/';

page.viewportSize = {
    width: 1024,
    height: 768
};

colors.setTheme({
    info: 'green',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

page.onConsoleMessage = function(msg, lineNum, sourceId) {
    console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
};

page.onUrlChanged = function(targetUrl) {
    console.log(('New URL: ' + targetUrl).debug);
};

page.onLoadFinished = function(status) {
    var consoleStatus = status === 'success' ? 'info' : 'error';
    console.log(('Status: ' + status)[consoleStatus]);
};

page.onAlert = function(msg) {
    console.log(('ALERT: ' + msg).debug);
};

phantom.onError = function(msg, trace) {
    var msgStack = ['PHANTOM ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function+')' : ''));
        });
    }
    console.error((msgStack.join('\n')).error);
    phantom.exit(1);
};

page.onResourceRequested = function(request) {
    console.log('Request ' + JSON.stringify(request, undefined, 4));
    console.log(request.url);
};

page.open(address, function(status) {
    if (status !== 'success') {
        console.log('FAIL to load the address'.error);
        phantom.exit(1);
    }

    var categories = page.evaluate(function(getCategories) {
        var elements = document.querySelectorAll('nav a');
        return getCategories(Array.prototype.slice.call(elements));
    }, getCategories);

    parseCategoriesContent(categories, 0);
});

function getCategories(categories) {
    return categories.map(function(item) {
        return {
            id: item.getAttribute('data-category_id'),
            title: item.innerText,
            href: item.href,
            content: []
        };
    });
}

function parseCategoriesContent(categories, index) {
    page.open(categories[index].href, function(status) {
        var content = page.evaluate(function(getItems) {
            var contentArray = [];
            var groupIndex = -1;
            var catalogContentList = document.querySelector('.catalog').children;
            var catalogContent = Array.prototype.slice.call(catalogContentList);

            catalogContent.forEach(function(item) {
                if (item.nodeName === 'DIV') {
                    groupIndex++;
                    contentArray.push({
                        name: item.innerText,
                        items: []
                    });
                } else if (item.childElementCount) {
                    var itemArray = [].slice.call(item.children);
                    contentArray[groupIndex].items = contentArray[groupIndex].items.concat(getItems(itemArray));
                }
            });

            return contentArray;
        }, getItems);
        categories[index].content.push(content);

        if (index < categories.length - 1) {
            parseCategoriesContent(categories, index + 1);
        } else if (categories.length) {
            sendContent(categories);
        }
    });
}

function getItems(items) {
    var contentArray = [];

    items.forEach(function(item) {
        var property = item.getElementsByTagName('a')[0];
        var content = property.getElementsByClassName('c__list-content')[0];
        var itemPrice = property.getElementsByClassName('c__list-price');
        var shortDetails = property.getElementsByClassName('c__list_short-details');

        if (itemPrice.length) {
            var contentDetails = {
                href: property.href,
                price: itemPrice[0].innerText,
                description: property.getElementsByClassName('c__list-desc')[0].innerText.trim(),
                image: property.getElementsByTagName('img')[0].src,
                product: content.getElementsByClassName('c__list-product')[0].innerText,
                title: content.getElementsByClassName('c__list-name')[0].innerText
            };

            if (shortDetails.length) contentDetails.shortDetails = shortDetails[0].innerText;

            contentArray.push(contentDetails);
        }
    });
    return contentArray;
}

function isUrl(s) {
    var regexp = /^(?:\w+:)?\/\/([^\s\.]+\.\S{2})\S*$/;
    return regexp.test(s);
}

function sendContent(content) {
    var settings = {
      operation: 'POST',
      encoding: 'utf8',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(content)
    };

    page.open(apiURL, settings, function(status) {
      console.log('Post data status:', status);
      phantom.exit(0);
    });
}
