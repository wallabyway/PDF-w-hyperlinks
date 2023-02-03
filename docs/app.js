import docbrowser from "./docbrowser.ext.js";
import hyperlink from "./hyperlinkpdf.ext.js";
import docbrowser2 from "./docbrowsertree.ext.js";


const AV = Autodesk.Viewing;
const dataFolder = "data";	

async function startViewer() {
	AV.Initializer({ env: 'AutodeskProduction', accessToken: "1231" }, async function () {
		const viewer = new Autodesk.Viewing.GuiViewer3D(
			document.getElementById('Viewer'),
			{ extensions: ["docBrowser2","Autodesk.Vault.Markups", "hyperlinksPdf", "docBrowser", "Autodesk.PDF", "Autodesk.DWF"] }
		);
		viewer.start();
		viewer.setTheme('light-theme');
		let filename = `data/Metal Container.idw_Sheet_1.pdf`;
		let params;
		if (window.location.search.length > 0) {
			params = Object.fromEntries(new URLSearchParams(location.search))
			if (params.url)
				filename = `${dataFolder}/${params.url}`
		}
		await viewer.unloadModel();
		viewer.loadModel(filename, {keepCurrentModels:false});
		if (params.partname) {
			await viewer.waitForLoadDone();
			viewer.search(params.partname, (results)=>{
				viewer.isolate(results);
				viewer.fitToView(results);
				viewer.select(results);
			}, null, ['Part Number']);
		}
	});
}	

startViewer();