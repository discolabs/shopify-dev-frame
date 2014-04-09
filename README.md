Shopify Embedded App Dev Frame
==============================

This project provides a simple HTML wrapper around an `<iframe>`, meant to simulate the environment of an Embedded App
in the Shopify admin panel. It's useful when developing Embedded Apps to get a feel for how your app will look and feel
once it's in the hands of your end users.

At the moment, the frame only replicates the visual layout of an embedded app. As we develop it further, we'll add
better support for mocking the `postMessage` API used by Embedded Apps to communicate with the Shopify Admin.


Usage
-----

Clone the repository and open `index.html` (the frame works fine with `file://` URLs). Bang in the development URL for
your app in the box provided and you're done!