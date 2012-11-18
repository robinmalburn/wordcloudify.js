wordcloudify.js
===============

Wordcloudify.js is a jQuery plugin for dynamically generating word clouds based on any element or elements on the page.

_Wordcloudify.js is ported from [Wordcloudify-chrome](https://github.com/robinmalburn/wordcloudify-chrome)_

Usage
-----
###Basic Usage
Run the wordcloudify method on the element you want to display the word cloud, for example:

```javascript
$(".wordcloud").wordcloudify();
```

Once the plugin is initialised on the display element, run the plugin's "render" method, passing in a jQuery selector for the element(s) you would like the word cloud to be derived from:

```javascript
$(".wordcloud").wordcloudify("render", $("div"));
```

The above example would generate a word cloud from every div on the page, then display the result in any element with the class "wordcloud".  **__Note:__** If the display element is a div, in this example, it's default text would also be included as part of the word cloud.

To remove the word cloud and restore the original elements & contents, simply re-run the wordcloudify plugin with the "destory" method.

```javascript
$(".wordcloud").wordcloudify("destroy");
```

###Options
When initialising the plugin on the display element, an object may be passed in to modify the following settings:

**stop_words** (array)  

Expects an array of strings.  
These words will be stripped from any text passed to the word cloud.  By default, Wordcloudify uses a common list of stop words which can be found in the [wordcloudify.js](https://github.com/robinmalburn/wordcloudify.js/blob/master/wordcloudify.js) file.  
**Note:** Stop words may include apostrophes, but all other non-alphabet words are stipped from the text.  Stop words are also case incensitive and will be reordered by the plugin to try and ensure the most accurate coverage of words.

**stop_words_extra** (array)  
Expects an array of strings.  
This array of words allows you to add to the list of stop words, without overwriting / replacing the default set.  This is useful if you simply want to catch a few additional phrases, perhaps specific to your use case, whilst still leaving the default set of stop words untouched.  By default, this array is empty.

**cloud_limit** (int)  
This is the maximum number of words to be included in the word cloud.  Defaults to `20` and takes any positive integer as a valid value.

**min_length** (int)  
The minimum lenth of a word to be included in the word cloud.  Defaults to `2` characters length.

**min_font** (number)  
Minimum font size to be used.  This font size will be applied to words with the lowest weight in the cloud, and increment in steps up to the max_font specification.  Defaults to `0.75`

**max_font** (number)  
Maximum font sized to be used.  This font size will be applied to words with the highest weight in the cloud, and increments in steps back to the min_font specification.  Defaults to `2.25`.

**font_unit** (string)  
This is the unit that will be applied to the min_font and max_font values.  Valid values are: `em`, `pt`, `%`.  Defaults to `em`

####Examples Usage
To change the available font sizes and unit, you could use the following:

```javascript
$(".wordcloud").wordcloudify({"min_font" : 6, "max_font" : 18, "font_unit" : "pt"});
```

Or to change the stop words used to only exclude the words javascript, cloud and html:

```javascript
var options = { "stop_words" : ["javascript", "cloud", "html"] }
$(".wordcloud").wordcloudify(options);
```

Or to add those words to the extra stop words, leaving the default stop words untouched:

```javascript
$(".wordcloud").wordcloudify({"stop_words_extra" : ["javascript", "cloud", "html"]});
```

###Styling
Wordcloudify draws the word cloud by adding `ul` and `li` elements to the display element.  The `ul` has the class "wordcloudify-results", whilst the `li` elements each have the class `wordcloudify-item`.  Default stylings for these elements can be found in the wordcloudify.css file, and can be modified there or overridden in your own CSS file.


Requirements / Compatability
----------------------------
Wordcloudify.js requires jQuery to run and has been tested against jQuery 1.8.2 (earlier versions of jQuery likely will work, however, the plugin has not yet been tested against anything but 1.8.2)

Tested & working in Google Chrome 23, Firefox 16 and Internet Explorer 8.  Also tested and working via IE Tester in IE 6 and 7.