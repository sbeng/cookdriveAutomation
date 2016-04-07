# cookdriveAutomation
Automated order and parsing actions

Installation
------------

  * Get Node:

        $ brew install node

  *  Get PhantomJS:

        $ brew install phantomjs

  *  Install dependencies:

        $ npm install

Usage
-----
Run parser:

	$ phantomjs src/parser.js <API URL>

Parsing result:
-----
    [{
        "content": [{
            "items": [{
                "description": "Селера стебло, петрушка, цукор...",
                "href": "http://cookdrive.com.ua/products/view/fitness.html",
                "image": "http://cookdrive.com.ua/var/catalog/products/thumbs/54ec2dbed4f6c.png",
                "price": "17 грн.",
                "product": "Салат",
                "shortDetails": "160г.",
                "title": "ФІТНЕС"
            },
            ...],
            "name": "Салати"   
        }, ...],
        "href": "http://cookdrive.com.ua/products/type/pisne-menyu",
        "id": "14",
        "title": "Пісне меню"
    },
    ...]
