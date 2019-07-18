(function main() {
	const linkEls = document.getElementsByTagName('a');
	const wait = time => new Promise(res => setTimeout(() => res(), time));
	for (const el of linkEls) {
		el.onclick = async e => {
			e.preventDefault();
			document.getElementsByTagName('main')[0].classList.add('slide');
			const html = await (await fetch(el.href)).text();
			await wait(1000);
			document.documentElement.innerHTML = html;
		}
	}
})();