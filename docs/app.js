import hyperlink from "./hyperlinkpdf.ext.js";
import docbrowser from "./docbrowsertree.ext.js";


const AV = Autodesk.Viewing;
const dataFolder = "data";	
let viewer = null;

async function startViewer() {
	AV.Initializer({ env: 'AutodeskProduction', accessToken: "1231" }, async function () {
		viewer = new Autodesk.Viewing.GuiViewer3D(
			document.getElementById('Viewer'),
			{ extensions: ["Autodesk.Vault.Markups", "hyperlinksPdf", "docBrowserTree", "Autodesk.PDF", "Autodesk.DWF"] }
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
		await viewer.waitForLoadDone();
		if (params.partname) {
			viewer.search(params.partname, (results)=>{
				viewer.isolate(results);
				viewer.fitToView(results);
				viewer.select(results);
			}, null, ['Part Number']);
		}
	});
}	

startViewer();

window.saveMarkups = async () => {
	const ext = await viewer.loadExtension("Autodesk.Vault.Markups");
	console.log(ext.markupLayers);
}		

