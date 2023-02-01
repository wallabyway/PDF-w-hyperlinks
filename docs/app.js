import docbrowser from "./docbrowser.ext.js";
import hyperlink from "./hyperlinkpdf.ext.js";


const AV = Autodesk.Viewing;

function startViewer(urn) {
	AV.Initializer({ env: 'Local' }, async function () {
		const viewer = new Autodesk.Viewing.GuiViewer3D(
			document.getElementById('Viewer'),
			{ extensions: ["hyperlinksPdf", "docBrowser"] }
		);
		viewer.start();
		viewer.setTheme('light-theme');
		viewer.loadExtension('Autodesk.PDF').then(() => {
			viewer.loadModel('Metal Container_Sheet_1.pdf');
		});
	});
}	

startViewer("dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YXV0b2NhZC13ZXMvSG9ydG9uJTIwUGxhemElMjAxMC4yNy4yMi5ud2Q");