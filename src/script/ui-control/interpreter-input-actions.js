/* jshint browser:true */
/* global define */
define(["./interpreter-uistate",
        "./store",
        "../utl/gaga",
        "../render/text/colorize"
        ],
        function(
            uistate,
            store,
            gaga,
            colorize) {
    "use strict";
    
    function _applyColorScheme(pSchemeName, pForce){
        uistate.manipulateSource(function(pAST){
            return colorize.applyScheme(pAST, pSchemeName, pForce);
        });
        _closeColorPanel();
        gaga.g('send', 'event', 'color.' + pSchemeName + (pForce ? "_force" : ""), 'button');
    }
    
    function _switchLanguage(pLanguage){
        uistate.switchLanguage(pLanguage);
        gaga.g('send', 'event', 'toggle_ms_genny', pLanguage);
    }
    
    function _closeColorPanel(){
        window.__color_panel.style.height = '0';
    }
    
    return {
        autorenderOnClick: function() {
            uistate.setAutoRender(!(uistate.getAutoRender()));
            if (uistate.getAutoRender()) {
                uistate.render (uistate.getSource(), uistate.getLanguage());
            }
            uistate.showAutorenderState (uistate.getAutoRender());
            gaga.g('send', 'event', 'toggle_autorender', 'checkbox');
        },
        languageMsGennyOnClick: function() { _switchLanguage("msgenny"); },
        languageMscGenOnClick: function() { _switchLanguage("mscgen"); },
        languageJSONOnClick: function() { _switchLanguage("json"); },
        colorAutoOnClick: function() { _applyColorScheme("auto", false); },
        colorAutoFOnClick: function() { _applyColorScheme("auto", true); },
        colorMinimalOnClick: function(){ _applyColorScheme("minimal", false); },
        colorMinimalFOnClick: function(){ _applyColorScheme("minimal", true); },
        colorRoseOnClick: function(){ _applyColorScheme("rosy", false); },
        colorRoseFOnClick: function(){ _applyColorScheme("rosy", true); },
        uncolorizeOnClick: function() {
            uistate.manipulateSource(colorize.uncolor);
            _closeColorPanel();
            gaga.g('send', 'event', 'color.remove', 'button');
        },
        renderOnClick: function() {
            uistate.render(uistate.getSource(), uistate.getLanguage());
            gaga.g('send', 'event', 'render', 'button');
        },
        samplesOnChange: function () {
            uistate.setSample(window.__samples.value);
            gaga.g('send', 'event', 'selectexample', window.__samples.value);
        },
        saveOnClick: function() {
            store.save(uistate);
            gaga.g('send', 'event', 'save', 'button');
        },
        loadOnClick: function(){
            store.load(uistate);
            gaga.g('send', 'event', 'load', 'button');
        },
        moreColorSchemesOnClick: function(){
            var lHeight = window.__color_panel.style.height.toString();
            if ( lHeight === '0px' || lHeight === ""){
                window.__color_panel.style.height = '250px';
            } else {
                window.__color_panel.style.height = '0';
            }
            gaga.g('send', 'event', 'more_color_schemes', 'button');
        },
        closeColorPanel: _closeColorPanel
    };
});
/*
 This file is part of mscgen_js.

 mscgen_js is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 mscgen_js is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with mscgen_js.  If not, see <http://www.gnu.org/licenses/>.
 */
