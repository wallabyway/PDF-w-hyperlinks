const AV = Autodesk.Viewing;

///////////////////////////////////////////////////////////////////
// your extension code goes here.... 
 export default class hyperlinksPdf extends AV.Extension {
	unload() { return true }
	load() { 
		console.log('hyperlinksPdf...loaded'); 
		return true 
	}
}
AV.theExtensionManager.registerExtension("hyperlinksPdf", hyperlinksPdf);

