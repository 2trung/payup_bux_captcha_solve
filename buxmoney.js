// ==UserScript==
// @name         BuxMoney Captcha Solve
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Bux.money Captcha Solve via goodxevil
// @author       Trung Nguyen
// @match        https://nonagon-oboe-j6hh.squarespace.com/*
// @icon         https://bux.money/assets/media/logos/favicon.ico
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    window.addEventListener('load', function() {
        const apikey = "Xevil API";
        var wrapperCaptcha;
        var styleAttribute;
        var capID;
        var body;
        var capElement;

        function checkElementStyle() {
            wrapperCaptcha = document.getElementById("wrapper_captcha");
            capElement = wrapperCaptcha.children[1].firstElementChild;
            capID = capElement.getAttribute("id");
            styleAttribute = capElement.getAttribute('style');
            if (styleAttribute == null || styleAttribute == "background: white;") {
                setTimeout(checkElementStyle, 1000);
            } else {
                var body = styleAttribute.match(/background:\s*url\((['"])?(.*?)\1\)/)[2];
                body = body.slice(22)
                const formData = new FormData();
                formData.append("method", "buxmoney");
                formData.append("key", apikey);
                formData.append("body", body);
                postCaptcha(apikey, body);
            }
        }

        checkElementStyle();




        function clickElementAtPosition(x, y) {
            const element = document.elementFromPoint(x, y);
            if (element) {
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    clientX: x,
                    clientY: y,
                });

                element.dispatchEvent(clickEvent);
            }
        }


        function postCaptcha(apikey, body) {
            const formData = new FormData();
            formData.append('method', 'buxmoney');
            formData.append('key', apikey);
            formData.append('body', body);

            return fetch("https://goodxevilpay.pp.ua/in.php", {
                    method: "POST",
                    body: formData,
                })
                .then((response) => response.text())
                .then((data) => {
                    var res = data.split("|");
                    var captcha_id = res[1];
                    pollCaptchaStatus(apikey, captcha_id);
                })
                .catch((error) => {
                    console.error("POST Error:", error);
                });
        }

        function pollCaptchaStatus(apikey, captcha_id) {
            const url = `https://goodxevilpay.pp.ua/res.php?key=${apikey}&id=${captcha_id}`;

            return fetch(url)
                .then((response) => {
                    if (response.ok) {
                        return response.text();
                    } else {
                        throw new Error(`HTTP Error: ${response.status}`);
                    }
                })
                .then((data) => {
                    if (data === "CAPCHA_NOT_READY") {
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                pollCaptchaStatus(apikey, captcha_id)
                                    .then((result) => resolve(result));
                            }, 3000);
                        });
                    } else {
                        var element = document.getElementById(capID);
                        var parts = data.split('=');
                        var x = parseInt(parts[1].split(",")[0], 10);
                        var y = parseInt(parts[2], 10);
                        const rect = element.getBoundingClientRect();
                        var x_new = rect.left + x;
                        var y_new = rect.top + y;
                        clickElementAtPosition(x_new, y_new);
                    }
                })
                .catch((error) => {
                    console.error("GET Error:", error);
                });
        }
    });
})();
