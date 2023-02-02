const AV = Autodesk.Viewing;
const dataFolder = "data";	

///////////////////////////////////////////////////////////////////
// Toolbar Button
export default class docBrowser extends AV.Extension {
	unload() { return true }
	async load() {
		console.log('docBrowser...loaded'); 
		// add toolbar
		await this.viewer.waitForLoadDone();
		this.addToolbarButton(this.viewer);
		return true;
	}

	addToolbarButton(viewer) {
			// button to show the docking panel
			var button = new AV.UI.Button('docBrowserPanel');
			button.icon.classList.add("adsk-icon-structure");
			button.container.style.color = "orange";
			button.addClass('propertyInspectorToolbarButton');
			button.setToolTip('Property Inspector Panel');

			// SubToolbar
			this.subToolbar = new AV.UI.ControlGroup('PropertyInspectorToolbar');
			this.subToolbar.addControl(button);		
			viewer.toolbar.addControl(this.subToolbar);		

			button.onClick = function (e) {
				// if null, create it
				if (this.panel == null) {
					this.panel = new docBrowserPanel(viewer, viewer.container, 'DocBrowser', 'Document Browser');
					//JSON = {};
					this.panel.loadData(viewer);
				}
				this.panel.container.style.left='5px';
				this.panel.container.style.top='5px';
				this.panel.container.style.height="400px";
				this.panel.container.style.width="420px";
				this.panel.container.dockRight=false;
		
				this.panel.setVisible(!this.panel.isVisible());
			};			
	}
}
AV.theExtensionManager.registerExtension("docBrowser", docBrowser);



///////////////////////////////////////////////////////////////////
// Pop-up Panel
class docBrowserPanel extends AV.UI.PropertyPanel {
    constructor(viewer, container, id, title, options) {
        super(container, id, title, options);
        this.viewer = viewer;
    }

	async loadData() {
		const filelist = await (await fetch(`${dataFolder}/test.json`)).json();
		this.addProperty('3D', filelist.url, '3D-VIEWS');
		this.addProperty('PDF',filelist.children[0].url, 'Metal Container');
		this.addProperty('PDF',filelist.children[1].children[0].url, 'Metal Container');
		this.addProperty('PDF',filelist.children[1].children[1].url, 'Metal Container');
	}

	async onPropertyClick(property, e) {
		if (property.value.indexOf('urn:')>=0) {
			Autodesk.Viewing.Document.load(`${property.value}`, (doc) => {
                var viewables = doc.getRoot().getDefaultGeometry();
				this.viewer.loadDocumentNode(doc, viewables);
			});
		}
		else {
			await this.viewer.unloadModel();
			this.viewer.loadModel(`${dataFolder}/${property.value}`, {keepCurrentModels:false});
		}
	}
}