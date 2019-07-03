const imagesList = document.getElementById('images');

const observer = new IntersectionObserver(handleNewContentObserve, { threshold: .5 });

let prevY = 0;

handleNewContentObserve();

async function handleNewContentObserve(entries) {
	if (entries) {
		if (!entries[0].isIntersecting) return;
		observer.unobserve(entries[0].target);
		const currY = entries[0].boundingClientRect.y;
		if (currY <= prevY) {
			prevY = currY; 
			return;
		}
	}
	console.log('Loading new images');
	await wait(1000);
	const contents = await getNewContents();
	for (el of contents) {
		imagesList.appendChild(el);
	}
};
