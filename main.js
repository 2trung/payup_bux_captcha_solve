// ==UserScript==
// @name         Payup, BuxMoney, WorkerCash Captcha Solve
// @version      1.0
// @description  Captcha solve via goodxevil
// @author       Trung Nguyen
// @match        https://*.squarespace.com/*
// @icon         https://www.tampermonkey.net/favicon.ico
// @downloadURL  https://github.com/2trung/payup_bux_workcash_captcha_solve/main.js
// @updateURL    https://github.com/2trung/payup_bux_workcash_captcha_solve/main.js
// @grant        none
// ==/UserScript==
(function() {

	'use strict';
	window.addEventListener('load', function() {
		const apikey = "Xevil API";
		var styleAttribute;
		var capID;
		var wrapperCaptcha;
		var base64Captcha;


		if (window.location.href.includes('https://chipmunk-algae-zbbz.squarespace.com/')) {
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
					html2canvas(captchaElement).then(canvas => {
						base64Captcha = canvas.toDataURL('image/png');
						postCaptcha(apikey, base64Captcha, 'workcash');

					});
				}
			}
			checkCaptcha();
		} else {
			var element = document.getElementById("captcha");
			if (element != null) {
				function checkCaptcha() {
					element = document.getElementById("captcha");
					capID = 'captcha';

					styleAttribute = element.getAttribute('style');

					if (styleAttribute == null || styleAttribute == "background: white;") {
						setTimeout(checkCaptcha, 1000);
					} else {
						var body = styleAttribute.match(/background:\s*url\((['"])?(.*?)\1\)/)[2];
						body = body.slice(22)
						const formData = new FormData();
						postCaptcha(apikey, body, 'buxmoney');
					}
				}
                checkCaptcha();

			} else {
				function checkCaptcha() {
					wrapperCaptcha = document.getElementById("wrapper_captcha");
					var capElement = wrapperCaptcha.children[1].firstElementChild;
					capID = capElement.getAttribute("id");
					styleAttribute = capElement.getAttribute('style');
					if (styleAttribute == null || styleAttribute == "background: white;") {
						setTimeout(checkCaptcha, 1000);
					} else {
						var body = styleAttribute.match(/background:\s*url\((['"])?(.*?)\1\)/)[2];
						body = body.slice(22)
						postCaptcha(apikey, body, 'buxmoney');
					}
				}
                checkCaptcha();
			}
		}

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


		function postCaptcha(apikey, body, method) {
			const formData = new FormData();
			formData.append('method', method);
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
						if (data.length > 30) {
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
					}
				})
				.catch((error) => {
					console.error("GET Error:", error);
				});
		}

	});
})();
