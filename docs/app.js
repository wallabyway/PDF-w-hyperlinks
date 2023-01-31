import docbrowser from "docbrowser.ext.js";
import hyperlink from "hyperlinkpdf.ext.js";


const AV = Autodesk.Viewing;
const div = document.getElementById("Viewer");

///////////////////////////////////////////////////////////////////
// your extension code goes here.... 
class MyExtension extends AV.Extension {
	unload() { return true }
	load() { return true }
}
AV.theExtensionManager.registerExtension("MyExtension", MyExtension);

///////////////////////////////////////////////////////////////////

function startViewer(urn) {
AV.Initializer({ env: 'Local' }, async function () {
    const viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById('preview'));
    viewer.start();
    viewer.setTheme('light-theme');
    viewer.loadExtension('Autodesk.PDF').then(() => {
        viewer.loadModel('/ visualization_-_aerial.pdf');
    });
});	

startViewer("dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YXV0b2NhZC13ZXMvSG9ydG9uJTIwUGxhemElMjAxMC4yNy4yMi5ud2Q");