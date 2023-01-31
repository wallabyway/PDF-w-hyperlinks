const AV = Autodesk.Viewing;

///////////////////////////////////////////////////////////////////
// your extension code goes here.... 
class hyperlinksPdf extends AV.Extension {
	unload() { return true }
	load() { return true }
}
AV.theExtensionManager.registerExtension("hyperlinksPdf", hyperlinksPdf);

