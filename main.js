fetch(`https://graph.facebook.com/100003406357473/picture?type=large`)
	.then(res => {
		console.log(res);
		const reader = res.body.getReader();
		return new ReadableStream({
	    start(controller) {
	    	return pump();
	    	function pump() {
	    		return reader.read().then(({ done, value }) => {
	    		// When no more data needs to be consumed, close the stream
		    		if (done) {
		     			controller.close();
		    			return;
		    		}
		    		// Enqueue the next data chunk into our target stream
		    		controller.enqueue(value);
		    		return pump();
		    	});
		    }
			}  
		});
	})
	.then(stream => new Response(stream))
	.then(response => response.blob())
	.then(blob => URL.createObjectURL(blob))
	.then(url => { image.src = url })
	.catch(err => console.error(err));