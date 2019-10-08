(function breadcrumb() {
	const titles = location.href.slice(location.origin.length).split(`/`);

	const breadcrumb = document.createElement('nav');
	breadcrumb.id = 'breadcrumb';
	const ul = document.createElement('ul');
	for (let i = 0; i < titles.length - 1; ++i) {
		ul.appendChild(toLink(titles.slice(0, i + 1)));
	}

	breadcrumb.appendChild(ul);
	document.body.appendChild(breadcrumb);

	function toLink(hrefs) {
		const el = document.createElement('a');
		const li = document.createElement('li');
		if (hrefs.length === 1) {
			el.href = `/`;
			el.textContent = 'Home';
		} else {
			el.href = hrefs.join(`/`);
			el.textContent = hrefs[hrefs.length - 1];
		}
		li.appendChild(el);
		return li;
	}
})();