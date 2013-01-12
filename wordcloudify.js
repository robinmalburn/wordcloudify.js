/*
 *Copyright (c) 2012 Robin Malburn
 *See the file license.txt for copying permission.
 */
 
 /*jslint vars: true, white: true, browser: true, devel: true */ /*global $, jQuery*/

 (function($){
    "use strict";

    var defaults = {
        "stop_words" :["a","about","above","after","again","against","all","am","an","and","any","are","aren\'t","as","at","be","because","been","before","being","below","between"
        ,"both","but","by","can\'t","can","cannot","could","couldn\'t","did","didn\'t","do","does","doesn\'t","doing","don\'t","down","during","each","few","for","from","further","had","hadn\'t",
        "has","hasn\'t","have","haven\'t","having","he","he\'d","he\'ll","he\'s","her","here","here\'s","hers","herself","him","himself","his","how","how\'s","i","i\'d","i\'ll","i\'m","i\'ve",
        "if","into","in","isn\'t","is","it\'s","it","its","itself","let\'s","me","more","most","mustn\'t","my","myself","no","nor","not","of","off","on","once","only","or","other","ought",
        "our","ours ","ourselves","out","over","own","same","shan\'t","she","she\'d","she\'ll","she\'s","should","shouldn\'t","so","some","such","than","that","that\'s","the","their","theirs",
        "them","themselves","then","there","there\'s","these","they","they\'d","they\'ll","they\'re","they\'ve","this","those","through","to","too","under","until","up","very","was","wasn\'t"
        ,"we","we\'d","we\'ll","we\'re","we\'ve","were","weren\'t","what","what\'s","when","when\'s","where","where\'s","which","while","who","who\'s","whom","why","why\'s","with","won\'t","would"
        ,"wouldn\'t","you","you\'d","you\'ll","you\'re","you\'ve","your","yours","yourself","yourselves"],
        "stop_words_extra" : [],
        "cloud_limit" : 20,
        "min_length" : 2,
        "min_font" : 0.75,
        "max_font" : 2.25,
        "font_unit" : "em",
        "source" : undefined,
        "default_state" : "on",
        "colors"  : {
            "start" : "999",
            "end" : "#000000"
        }
    };
    
    /**
     * Sort array by word weight, or alphabetical if words share weight
     * @var object a
     * @var object b
     * @returns int
     */
     function array_sort_weight(a, b){
        if(a.weight === b.weight){
            return a.word > b.word ? 1 : a.word < b.word ? -1 : 0;
        }

        return a.weight < b.weight ? 1 : -1;
    }
    
    /**
     * Simple random-ish array sort.  
     * Should probably be a Fisher-Yates shuffle, but for now this will do
     * @var object a
     * @var object b
     * @returns number
     */
     function array_sort_random(a, b){
        return 0.5 - Math.random();
    }
    
    /**
     * Sorts array placing words with apostrophes at the top of the list, and then sorting alphabetically
     * @var object a
     * @var object b
     * @returns int
     */
     function array_sort_stop_words(a, b){

        if(a.toLowerCase()[0] === b.toLowerCase()[0]){

            var a_index = a.indexOf("'");
            var b_index = b.indexOf("'");

            if(a_index !== -1 && b_index === -1){
                return -1;
            }
            else if(a_index === -1 && b_index !== -1){
                return 1;
            }
            else if(a > b){
                return 1;
            }
            else if(a < b){
                return -1;
            }
            else{
                return 0;
            }
        }
        else{
            if(a > b){
                return 1;
            }
            else if(a < b){
                return -1;
            }
            else{
                return 0;
            }
        }
    }

    /**
     * Simple conversion from hexadecimal to decimal
     * @param string hex
     * @return int
     */
    function hex2dec(hex){
        return parseInt(hex, 16);
    }

    /**
     * Simple conversion from decimal to hexadecimal with CSS-friendly padding
     * @param int dec
     * @return string
     */
    function dec2hex(dec){
        //ensure we're only ever dealing wtih integers
        var hex = Math.floor(dec).toString(16);

        //if the hexstring is a single character, pad with a leading zero
        if(hex.length === 1){
            hex = "0"+hex;
        }

        return hex;
    }

    /**
     * Converts the given colour into an object containing the full hex colour as well as split into red, green and blue hex components
     * @param  string color Hex colour string, either full or short form
     * @return object
     */
    function parse_color(color){
        if(color.length === 4 || color.length === 7){
            color = color.replace("#", "");
        }

        if(color.length === 3){
            //Expand 3 character hex colours to 6 character code
            color = color.replace(/(\w)(\w)(\w)/gi, "\$10\$20\$30");
        }

        if(color.length !== 6){
            return false;
        }

        color = /(\w{2})(\w{2})(\w{2})/.exec(color);

        color = {
            "color" : "#"+color[0],
            "hex" : {
                "red" : color[1],
                "green" : color[2],
                "blue" : color[3]    
            },
            "rgb" : {
                "red" : hex2dec(color[1]),
                "green" : hex2dec(color[2]),
                "blue" : hex2dec(color[3]) 
            }
        };

        return color;
    }

    /**
     * Gets the colour steps required to get from the start colour to the end colour
     * @param  object start Start colour object
     * @param  object end   End colour object
     * @param  int range The range, i.e. number of steps, required
     * @return object
     */
    function color_to_step(start, end, range){
        var color = {
            "rgb" : {
                "red" : Math.round((end.rgb.red - start.rgb.red) / range),
                "green" : Math.round((end.rgb.green - start.rgb.green) / range),
                "blue" : Math.round((end.rgb.blue - start.rgb.blue) / range)
            }, 
            "hex" : {}
        };

        color.hex = {
            "red" : dec2hex(color.rgb.red),
            "green" : dec2hex(color.rgb.green),
            "blue" : dec2hex(color.rgb.blue)
        };

        return color;
    }

    /**
     * Gets the new colour based on start point, colour step and weight
     * @param  object start  Start colour object
     * @param  object step   Step colour object
     * @param  int weight Weight to apply to colour
     * @return object
     */
    function color_from_step(start, step, weight){
        var color = {};

        color.rgb = {
            "red" : start.rgb.red+(step.rgb.red*weight),
            "green" : start.rgb.green+(step.rgb.green*weight),
            "blue" : start.rgb.blue+(step.rgb.blue*weight)
        };

        color.hex = {
            "red" : dec2hex(color.rgb.red),
            "green" : dec2hex(color.rgb.green),
            "blue" : dec2hex(color.rgb.blue),
        }

        color.color = "#"+color.hex.red+color.hex.green+color.hex.blue;

        return color;
    }


    
    var methods = {
        init : function(options){

            var settings = $.extend(true, {}, defaults, options);
            
            settings.stop_words = settings.stop_words.sort(array_sort_stop_words);
            settings.stop_words_extra = settings.stop_words_extra.sort(array_sort_stop_words);

            if(settings.source === undefined){
                settings.source = this;
            }

            settings.colors.start = parse_color(settings.colors.start);
            settings.colors.end = parse_color(settings.colors.end);

            //if invalid colours were passed in, catch it heare and reset to default colour scheme
            settings.colors.start = settings.colors.start === false ? defaults.colors.start : settings.colors.start;
            settings.colors.end = settings.colors.end === false ? defaults.colors.end : settings.colors.end;
            
            return this.each(function(){
                if($(this).data("wordcloudify") === undefined){
                    $(this).data("wordcloudify", {
                        "original" : $(this).clone(true), 
                        "settings" : settings,
                        "state" : undefined
                    });    
                }
                else{
                    var data = $(this).data("wordcloudify");
                    data.settings = $.extend({}, data.settings, settings);
                    $(this).data("wordcloudify", data);
                }

                if(settings.default_state === "on")
                {
                    methods.on.call($(this));
                }
            });
        },
        on : function(){
            return this.each(function(){
                var data = $(this).data("wordcloudify");
                if(data !== undefined && data.state !== "on"){
                    methods.render.apply($(this));
                }
            });
        },
        off : function(){
            return this.each(function(){
                var data = $(this).data("wordcloudify");
                if(data !== undefined && data.state === "on"){
                    data.state = "off";
                    var clone = data.original.clone();
                    clone.data("wordcloudify", data);

                    $(this).replaceWith(clone);
                }
            });
        },
        toggle : function(){
            return this.each(function(){
                var data = $(this).data("wordcloudify");
                if(data !== undefined){
                    if(data.state !== "on"){
                        methods.on.call($(this));
                    }
                    else{
                        methods.off.call($(this));
                    }
                }
            });
        },
        render : function(selector){
            var data = this.data("wordcloudify");

            if(data === undefined){
                methods.init.call(this);
                data = this.data("wordcloudify");                
            }

            if(selector === undefined){
                selector = data.settings.source;
            }
            
            data.settings.stop_words = data.settings.stop_words.sort(array_sort_stop_words);
            data.settings.stop_words_extra = data.settings.stop_words_extra.sort(array_sort_stop_words);
            
            var text = "";
            
            var results = false;

            selector.each(function(){
                text += $(this).text()+" ";
            });

            if(typeof data.settings.stop_words === "object" && data.settings.stop_words.length > 0){
                var stop_words_regex = new RegExp("\\b("+data.settings.stop_words.join("|")+")\\b", "gi");
                text = text.replace(stop_words_regex, "");
            }
            
            if(typeof data.settings.stop_words_extra === "object" && data.settings.stop_words_extra.length > 0){
                var stop_words_extra_regex = new RegExp("\\b("+data.settings.stop_words_extra.join("|")+")\\b", "gi");
                text = text.replace(stop_words_extra_regex, "");
            }

            var words = text.match(/\b[a-z]+('[a-z])?\b/gi);

            if(words !== null && words.length > 0){

                var tmp_weighted_words = {};
                var weighted_words = [];

                for(var i = 0; i < words.length; i++){
                    if(words[i].length > data.settings.min_length){
                        if(tmp_weighted_words[words[i].toLowerCase()] === undefined){
                            tmp_weighted_words[words[i].toLowerCase()] = 1;
                        }
                        else{
                            tmp_weighted_words[words[i].toLowerCase()] += 1;
                        }
                    }
                }
                
                for(var word in tmp_weighted_words){
                    weighted_words.push({
                        "word" : word, 
                        "weight" :tmp_weighted_words[word]
                    });
                }

                weighted_words.sort(array_sort_weight);

                if(weighted_words.length > 0){
                    if(data.settings.cloud_limit > 0){
                        results = weighted_words.slice(0, data.settings.cloud_limit);
                    }
                    else{
                        results = weighted_words;
                    }
                }
            }
            var output = "";

            if(typeof results === "object" && results.length > 0){

                var min_val = results.slice(-1)[0].weight;
                var max_val = results.slice(0,1)[0].weight;
                var font_step = (data.settings.max_font - data.settings.min_font) / (max_val - min_val);
                var color_step =  color_to_step(data.settings.colors.start, data.settings.colors.end, (max_val - min_val));
                
                results = results.sort(array_sort_random);

                output += "<ul class='wordcloudify-results'>"
                for(var word in results){
                    var new_font = (data.settings.min_font+(font_step*(results[word].weight-min_val)))+data.settings.font_unit;
                    var new_color = color_from_step(data.settings.colors.start, color_step, (results[word].weight-min_val));
                    output += "<li class='wordcloudify-item' data-weight='"+results[word].weight+"' style='font-size:"+new_font+";color: "+new_color.color+";'>"+results[word].word+" </li>"
                }
                output += "</ul>"
            }
            else{
                output = "No valid words";
            }

            return this.each(function(){
                data.state = "on";
                $(this).data("wordcloudify", data);
                $(this).html(output);
            });
        },
        destroy : function(){
            return this.each(function(){
                var data = $(this).data("wordcloudify");
                if(data !== undefined && data.original !== undefined){
                    $(this).replaceWith(data.original);
                }
            });
        }
    };

    $.fn.wordcloudify = function(method){
        if(methods[method]){
            return methods[method].apply(this, Array.prototype.slice.call(arguments,1));
        }
        else if(typeof method === 'object' || ! method){
            return methods.init.apply(this, arguments);
        }
        else{
            $.error("Method "+method+" does not exist on jQuery.wordcloudify");
        }
    };

})(jQuery);
