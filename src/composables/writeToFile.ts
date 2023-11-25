
export const writeToFile = async (data: FrameData[], fileName: string) => {
	if (fileName && data) {
		const csvContent = 'frame_number,time,landmark,x,y,z\n' + data.map(row => Object.values(row).join(',')).join('\n');
		const blob = new Blob([ csvContent ], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = fileName;
		a.click();
	} else {
		alert('Please enter data to save.');
	}

};

