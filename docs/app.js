import docbrowser from "./docbrowser.ext.js";
import hyperlink from "./hyperlinkpdf.ext.js";


const AV = Autodesk.Viewing;

async function startViewer() {
	AV.Initializer({ env: 'AutodeskProduction' }, async function () {
		const viewer = new Autodesk.Viewing.GuiViewer3D(
			document.getElementById('Viewer'),
			{ extensions: ["hyperlinksPdf", "docBrowser", "Autodesk.PDF"] }
		);
		viewer.start();
		viewer.setTheme('light-theme');
		viewer.loadModel(`data/Metal Container_Sheet_1.pdf`);
	});
}	

startViewer();