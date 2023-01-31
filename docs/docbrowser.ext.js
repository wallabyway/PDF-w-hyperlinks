const AV = Autodesk.Viewing;

///////////////////////////////////////////////////////////////////
// your extension code goes here.... 
class docBrowser extends AV.Extension {
	unload() { return true }
	load() { return true }
}
AV.theExtensionManager.registerExtension("docBrowser", docBrowser);

