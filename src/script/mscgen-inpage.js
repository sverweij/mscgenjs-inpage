/* jshint browser:true */
/* global require */
require(["parse/xuparser",
         "parse/msgennyparser",
         "render/graphics/renderast",
         "utl/utensils",
         "ui/utl/exporter",
         "ui/embedding/config",
         "ui/utl/domutl"],
        function(mscparser, msgennyparser, mscrender, _, exp, conf, $) {
    "use strict";

    start();

    function start() {
        var lClassElements = document.getElementsByClassName("mscgen_js");
        renderElementArray(lClassElements, 0);
        renderElementArray(document.getElementsByTagName("mscgen"), lClassElements.length);
    }

    function formatLine(pLine, pLineNo){
        return _.formatNumber(pLineNo, 3) + " " + pLine;
    }

    function underlineCol(pLine, pCol){
        return pLine.split("").reduce(function(pPrev, pChar, pIndex){
            if (pIndex === pCol) {
                return pPrev + "<span style='text-decoration:underline'>" + pChar + "</span>";
            }
            return pPrev + pChar;
        }, "");
    }

    function renderElementArray(pMscGenElements, pStartIdAt){
        for (var i = 0; i < pMscGenElements.length; i++) {
            processElement(pMscGenElements[i], pStartIdAt + i);
        }
    }

    function processElement(pElement, pIndex) {
        if (!pElement.hasAttribute('data-renderedby')) {
            renderElement(pElement, pIndex);
        }
    }

    function renderError(pSource, pErrorLocation, pMessage){
        var lErrorIntro = !!pErrorLocation ?
            "<pre><div style='color: red'># ERROR on line " + pErrorLocation.start.line + ", column " + pErrorLocation.start.column + " - " + pMessage + "</div>" :
            "<pre><div style='color: red'># ERROR " + pMessage + "</div>";

        return pSource.split('\n').reduce(function(pPrev, pLine, pIndex) {
            if (!!pErrorLocation && pIndex === (pErrorLocation.start.line - 1)) {
                return pPrev + "<mark>" + formatLine(underlineCol(pLine, pErrorLocation.start.column - 1), pIndex + 1) + '\n' + "</mark>";
            }
            return pPrev + formatLine(pLine, pIndex + 1) + '\n';
        }, lErrorIntro) + "</pre>";
    }

    function renderElement (pElement, pIndex){
        setElementId(pElement, pIndex);
        pElement.setAttribute("data-renderedby", "mscgen_js");

        if (conf.getConfig().loadFromSrcAttribute && !!pElement.getAttribute("src")){
            $.ajax(
                pElement.getAttribute("src"),
                function onSuccess(pEvent) {
                    parseAndRender(pElement, pEvent.target.response);
                },
                function onError() {
                    pElement.innerHTML =
                          "<code><div style='color: red'>" +
                          "ERROR: Could not find or open the URL '" +
                          pElement.getAttribute("src") +
                          "' specified in the <code>src</code> attribute.</div></code>";
                }
            );
        } else {
            parseAndRender(pElement, pElement.textContent);
        }
    }

    function parseAndRender(pElement, pSource){
        var lLanguage = getLanguage(pElement);
        var lAST      = getAST(pSource, lLanguage);

        if (lAST.entities) {
            render(lAST, pElement.id, pSource, lLanguage);
        } else {
            pElement.innerHTML = renderError(pSource, lAST.location, lAST.message);
        }
    }

    function renderLink(pSource, pLanguage, pId){
        var lLocation = {
            pathname: "index.html"
        };

        var lLink = document.createElement("a");
        lLink.setAttribute("href", conf.getConfig().clickURL + exp.toLocationString(lLocation, pSource, pLanguage));
        lLink.setAttribute("id", pId + "link");
        lLink.setAttribute("style", "text-decoration: none;");
        lLink.setAttribute("title", "click to edit in the mscgen_js interpreter");
        return lLink;
    }

    function setElementId(pElement, pIndex) {
        if (!pElement.id) {
            pElement.id = conf.getConfig().parentElementPrefix + pIndex.toString();
        }
    }

    function getLanguage(pElement) {
        /* the way to do it, but doesn't work in IE: lLanguage = pElement.dataset.language; */
        var lLanguage = pElement.getAttribute('data-language');
        if (!lLanguage) {
            lLanguage = conf.getConfig().defaultLanguage;
        }
        return lLanguage;
    }

    function getAST(pText, pLanguage) {
        var lAST = {};
        try {
            if ("msgenny" === pLanguage) {
                lAST = msgennyparser.parse(pText);
            } else if ("json" === pLanguage) {
                lAST = JSON.parse(pText);
            } else {
                lAST = mscparser.parse(pText);
            }
        } catch(e) {
            return e;
        }
        return lAST;
    }

    function render(pAST, pElementId, pSource, pLanguage) {
        var lElement = document.getElementById(pElementId);
        lElement.innerHTML = "";

        if (true === conf.getConfig().clickable){
            lElement.appendChild(renderLink(pSource, pLanguage, pElementId));
            pElementId = pElementId + "link";
        }
        mscrender.clean(pElementId, window);
        mscrender.renderAST(pAST, pSource, pElementId, window);
    }

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
