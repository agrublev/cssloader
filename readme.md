Load by using
```javascript
docReady(function() {
    // require some stylesheets
    cssloader.require([
        {href: "/fcloader/stylesheets/style1.css", media: "screen"},
        {href: "stylesheets/style2.css", media: "screen"},
        {href: "stylesheets/style5.css", media: "screen"}
    ], {devMode: true});
});
// Alternatively with jquery
$(function(){
    // require some stylesheets
    cssloader.require([
        {href: "/fcloader/stylesheets/style1.css", media: "screen"},
        {href: "stylesheets/style2.css", media: "screen"},
        {href: "stylesheets/style5.css", media: "screen"}
    ], {devMode: true});
});
```

​
Compile less
Compile multiple css to one file
Load css using if on same domain checked
var client = new XMLHttpRequest();
client.open('GET', '/foo.txt');
client.onreadystatechange = function() {
alert(client.responseText);
}
client.send();
Load based on url parameter
// webpack.config.js
var ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = {
// The standard entry point and output config
entry: {
posts: "./posts",
post: "./post",
about: "./about"
},
output: {
filename: "[name].js",
chunkFilename: "[id].js"
},
module: {
loaders: [
// Extract css files
{
test: /\.css$/,
loader: ExtractTextPlugin.extract("style-loader", "css-loader")
},
// Optionally extract less files
// or any other compile-to-css language
{
test: /\.less$/,
loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")
}
// You could also use other loaders the same way. I. e. the autoprefixer-loader
]
},
// Use the plugin to specify the resulting filename (and add needed behavior to the compiler)
plugins: [
new ExtractTextPlugin("[name].css")
]
}