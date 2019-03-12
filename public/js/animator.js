(function (ns) {
	ns.ball = async function (element) {
		let rects = element.getBoundingClientRect();

		element.style.borderRadius = Math.max(rects.width, rects.height) + 'px';

		let target = Math.min(rects.width, rects.height, 50);
		let originalColor = window.getComputedStyle(element).color;
		$(element).css({
			'color': 'transparent'
		});

		$(element).animate({
			width: Math.min(rects.width, target) + 'px',
			height: Math.min(rects.height, target) + 'px'
		}, 600);

		await window.sleep(1200);

		let reset = async function () {
			this.css({color: originalColor, width: rects.width + 'px', height: rects.height + 'px'});
		};

		return reset.bind($(element));
	};

	ns.expand = async function (element, options = {}) {
		let div = document.createElement('div');
		let rects = element.getBoundingClientRect();

		Object.assign(div.style, {
			 background: options.background || $(element).css('backgroundColor'),
			 position: 'absolute',
			 left: rects.left + (rects.width / 2) - 25 + 'px',
			 top: rects.top + (rects.height / 2 ) - 25 + 'px',
			 width: '50px',
			 height: '50px',
             borderRadius: '50px',
             transition: 'background 1s',
             zIndex: 9999
		});

		let originalVisible = element.style.visibility;
		element.style.visibility = 'hidden';
		$('body').append(div);

		$(div).animate({
			left: window.innerWidth / 2 + 'px',
			top: 0,
		}, 800);

		await sleep(800);

		if (options.finalBackground) {
			$(div).css({'backgroundColor': options.finalBackground});	
		}
		
		$(div).animate({
			width: window.innerWidth + 'px',
			height: window.innerHeight + 'px',
			left: 0,
			top: 0,
			borderRadius: 0
		}, 300);

		await sleep(options.finalBackground ? 1000 : 300);

		let reset = function () {
			this.remove();
			element.style.visibility = originalVisible;
		};

		return reset.bind($(div));
	};

})(window.Animator = {})