// ==UserScript==
// @name         WorkerCash Captcha Solve
// @version      1.0
// @description  worker.cash captcha solve via goodxevil
// @author       Trung Nguyen
// @match        https://chipmunk-algae-zbbz.squarespace.com/*
// @icon         https://worker.cash/assets/media/logos/favicon.ico
// @grant        none
// ==/UserScript==
(function() {

    'use strict';
    window.addEventListener('load', function() {
        const apikey = "Xevil API";

        var styleAttribute;
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.5.0-beta4/html2canvas.min.js';
        document.getElementsByTagName('head')[0].appendChild(script);

        function checkCaptcha() {

            var element = document.getElementById("captcha");

            styleAttribute = element.getAttribute('style');
            if (styleAttribute == null || styleAttribute == "background: white;") {
                setTimeout(checkCaptcha, 1000);
            } else {
                

                const captchaElement = document.querySelector('#wrapper_captcha');
                var base64Captcha
                html2canvas(captchaElement).then(canvas => {
                    base64Captcha = canvas.toDataURL('image/png');
                    postCaptcha(apikey, base64Captcha);
                    });
            }
        }

        checkCaptcha();

        function clickElementAtPosition(x, y) {
            const delayedClick = () => {
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
            };

            setTimeout(delayedClick, 1000);
        }


        function postCaptcha(apikey, body) {
            const formData = new FormData();
            formData.append('method', 'workcash');
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
                        var captchaElement = document.getElementById("wrapper_captcha");
                        const coordinates = data.split(';');
                        var x1, x2, x3, y1, y2, y3;
                        const coordinate1 = coordinates[0].split(',');
                        const coordinate2 = coordinates[1].split(',');
                        const coordinate3 = coordinates[2].split(',');

                        x1 = parseInt(coordinate1[0].split('=')[1]);
                        y1 = parseInt(coordinate1[1].split('=')[1]);

                        x2 = parseInt(coordinate2[0].split('=')[1]);
                        y2 = parseInt(coordinate2[1].split('=')[1]);

                        x3 = parseInt(coordinate3[0].split('=')[1]);
                        y3 = parseInt(coordinate3[1].split('=')[1]);

                        const rect = captchaElement.getBoundingClientRect();
                        clickElementAtPosition(rect.left + x1, rect.top + y1);
                        clickElementAtPosition(rect.left + x2, rect.top + y2);
                        clickElementAtPosition(rect.left + x3, rect.top + y3);
                    }
                })
                .catch((error) => {
                    console.error("GET Error:", error);
                });
        }

    });
})();
