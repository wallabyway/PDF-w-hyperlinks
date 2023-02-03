import docbrowser from "./docbrowser.ext.js";
import hyperlink from "./hyperlinkpdf.ext.js";
import docbrowser2 from "./docbrowsertree.ext.js";


const AV = Autodesk.Viewing;

async function startViewer() {
	AV.Initializer({ env: 'AutodeskProduction', accessToken: _access_token, }, async function () {
		const viewer = new Autodesk.Viewing.GuiViewer3D(
			document.getElementById('Viewer'),
			{ extensions: ["docBrowser2","Autodesk.Vault.Markups", "hyperlinksPdf", "docBrowser", "Autodesk.PDF", "Autodesk.DWF"] }
		);
		viewer.start();
		viewer.setTheme('light-theme');
		viewer.loadModel(`data/Metal Container.idw_Sheet_1.pdf`);
	});
}	

startViewer();