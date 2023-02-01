const AV = Autodesk.Viewing;

///////////////////////////////////////////////////////////////////
// your extension code goes here.... 
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


// Subclassing a "property panel" class
class docBrowserPanel extends AV.UI.PropertyPanel {
    constructor(viewer, container, id, title, options) {
        super(container, id, title, options);
        this.viewer = viewer;
    }

	async loadData() {
		const dataFolder = "data";	
		const filelist = await (await fetch(`${dataFolder}/test.json`)).json();
		this.addProperty('3D', filelist.url, '3D-VIEWS');
		this.addProperty('PDF', `${dataFolder}/${filelist.children[0].url}`, '2D-VIEWS');
		this.addProperty('PDF', `${dataFolder}/${filelist.children[1].children[0].url}`, '2D-VIEWS');
		this.addProperty('PDF', `${dataFolder}/${filelist.children[1].children[1].url}`, '2D-VIEWS');
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
			this.viewer.loadModel(property.value, {keepCurrentModels:false});
		}
	}
}

/*
export class Panel extends AV.UI.DockingPanel {
    constructor(extension) {
        super(extension.viewer.container, 'lmv-points-extension', 'Points', {});
        this.setGlobalManager(extension.globalManager);

        this.title.classList.add("docking-panel-delimiter-shadow");
        this.container.classList.add('property-panel');
        this.extension = extension;
        this.viewer = extension.viewer;
        this.nonScrollingContentHeight = 0;
    }

    destroy() {
        if (this.myTree) {
            this.myTree.destroy();
            this.myTree = null;
        }
        if (this.container) {
            this.container.parentElement.removeChild(this.container);
            this.container = null;
        }
        this.extension = null;
        this.viewer = null;
    }

    setVisible(show) {
        super.setVisible(show);
        show && this._create();
    }

    _create() {
        if (this.myTree) return;

        this.container.style.top = '20px';
        this.container.style.width = '420px';
        this.container.style.height = '480px';

		const _document = this.getDocument();
        // Present geolocation metadata
        let geoDiv = _document.createElement('div');
        geoDiv.className = 'docking-panel-container-solid-color-a';
        geoDiv.style['font-size'] = '12px';
        geoDiv.style['padding'] = '0px 6px';
        geoDiv.style['border'] = 'solid 5px green';
        geoDiv.innerHTML = GEO_HTML;
        this.container.appendChild(geoDiv);

        
        this._setGeolocationMetadata(geoDiv, this.viewer.model);

		
        // Scrolling panel
        this.nonScrollingContentHeight = geoDiv.clientHeight;
        const extraHeight = HEIGHT_ADJUSTMENT + this.nonScrollingContentHeight;
        this.createScrollContainer({left: false, heightAdjustment: extraHeight, marginTop: 0});
        
        // which contains a tree view
        var delegate = this._createDelegate(); 
		var options = {};
        this.myTree = new Autodesk.Viewing.UI.Tree(delegate, null, this.scrollContainer, options);

        // Bring footer forward
        this.container.removeChild(this.footer);
        this.container.appendChild(this.footer);

        this.resizeToContent();
    }

	_createDelegate() {
        var delegate = new AV.UI.TreeDelegate();
        delegate.setGlobalManager(this.globalManager);
        delegate.extension = this.extension;
        delegate.viewer = this.viewer;
        delegate.getTreeNodeId = function(node) {
            return node.__id;
        };
        delegate.getTreeNodeLabel = function(node) {
            return node.__id;
        };
        delegate.getTreeNodeClass = function(node) {
            return null;
        };
        delegate.isTreeNodeGroup = function(node) {
            return false;
        };
        delegate.shouldCreateTreeNode = function (node){
            return true;
        }
        // Adds additional HTML and styling to the created entry
        delegate.createTreeNode = function(node, header, options, type, depth) {

            header.innerHTML = `
			<label style="font-size:22px;">id</label>
			<div style="float:right; margin-top:6px; ">
				<button user-data="map" style="margin-right:10px;">Map</button> 
				<button user-data="close" style="margin-right:10px;">X</button> 
			</div>
			<table style="width:100%;">
				<tr user-data="lmv" title="Coordinates in LMV space, obtained via viewer.clientToWorld(mouseX, mouseY);">
					<td style="border: 1px solid black;">LMV</td>
					<td style="border: 1px solid #F44336;">x</td>
					<td style="border: 1px solid #4CAF50;">y</td>
					<td style="border: 1px solid #2196F3;">z</td>
				</tr>
				<tr user-data="wgs84" title="Longitude, Latitude, and Height in WGS84.">
					<td style="border: 1px solid black;">LonLat</td>
					<td style="border: 1px solid #F44336;">lon</td>
					<td style="border: 1px solid #4CAF50;">lat</td>
					<td style="border: 1px solid #2196F3;">height</td>
				</tr>
			</table>`;

            // Label for point identification
            header.querySelector('label').textContent = node.__id;

            // LMV { x, y, z } values
            var row = header.querySelector('tr[user-data="lmv"]');
            var xyz = row.querySelectorAll('td');
            setTextContent(xyz[1], node.point.x); // skip first cell
            setTextContent(xyz[2], node.point.y);
            setTextContent(xyz[3], node.point.z);

            // LonLat/WGS84 values
            row = header.querySelector('tr[user-data="wgs84"]');
            if (this.extension.hasGeolocationData()) {
                var lonLat = this.extension.lmvToLonLat(node.point);
                xyz = row.querySelectorAll('td');
                setTextContent(xyz[1], lonLat.x); // skip first cell
                setTextContent(xyz[2], lonLat.y);
                setTextContent(xyz[3], lonLat.z);
            } else {
                // Hide
                row.style.display = 'none';
            }
            

            // Hide "Map" button when there's no geolocation data for the model
            if (!this.extension.hasGeolocationData()) {
                header.querySelector('[user-data=map]').style.display = 'none';
            }
        };
        delegate.onTreeNodeClick = (tree, node, event) => {
            
            if (event.target.tagName === 'BUTTON') {
                
                let action = event.target.getAttribute('user-data');
                const _window = this.getWindow();
                switch (action) {
                    case 'close':
                        this.extension.removePoint(node);
                        return;

                    case 'map':
                        var lonLat = this.extension.lmvToLonLat(node.point);
                        let mapsUrl = this.extension.getGoogleMapsUrl(lonLat);
                        console.log(mapsUrl);
                        _window.open(mapsUrl);
                        return;
                }

                return;
            }

            // Restore camera position
            this.viewer.restoreState(node.__viewerState);
            //console.log(node.point);
        };

        return delegate;
    }
}
AV.theExtensionManager.registerExtension("docBrowser", docBrowser);








const TREE_VIEW_LEAF = 'leaf';
const TREE_VIEW_GROUP = 'group';


// Creates a Tree delegate, used to render the Model Browser's Tree View.

function createTreeViewDelegate(rootNode, panel) {

    // Iterate through all BubbleNodes and identify which ones are
    // going to be displayed by the Tree view.
    var treeViewData = collectTreeViewData(rootNode);

    var delegate = new Autodesk.Viewing.UI.TreeDelegate();
    delegate.setGlobalManager(panel.globalManager);
    delegate.getTreeNodeId = function(node) {
        return node.guid();
    };
    delegate.getTreeNodeLabel = function(node) {
        // Just the name for now, but can display any info from the node.
        //
        return node.name() || node._raw().type;
    };
    delegate.getTreeNodeClass = function(node) {
        // Return the type of the node.  This way, in css, the designer can specify
        // custom styling per type like this:
        //
        // group.design > icon.collapsed {
        //    background: url("design_open.png") no-repeat;
        //
        // group.design > icon.expanded {
        //    background: url("design_open") no-repeat;
        //
        return node.isGeometry() ? node._raw().type + '_' + node._raw().role : node._raw().type;
    };
    delegate.isTreeNodeGroup = function(node) {

        let guid = node.guid();
        let nodeType = treeViewData[guid];
        return nodeType === TREE_VIEW_GROUP;

        // Folders and designs are currently what we consider groups.
        //
        const isManifest = node._raw().type === 'manifest'; // model-derivative support
        if (isManifest) return true;

        const isFolder = node._raw().type === 'folder';
        if (isFolder) return true;

        const isDesign = node._raw().type === 'design';
        if (isDesign) return true;

        const isView = node._raw().type == 'view';
        if (isView) return false;

        const isSvf = node._raw().outputType == 'svf';
        if (isSvf) return true;

        // For geometries, check and see if there are one or more views
        // If there is only one view, make sure the name is different than
        // the current geometry node (UX requirement).
        if (node.isGeometry()) {
            const views = node.search({"type":"view"});
            if (views.length > 1)
                return true;

            if (views.length === 1) {

                // For 2D sheets don't show the view.
                if (views[0].is2D()) {
                    return false;
                }

                // For 3D, show the view when the name is different than the geometry's.
                const sameName = node.name() === views[0].name();
                return !sameName; // it's not a group if they have the same name.
            }
        }

        return false;
    };
    delegate.shouldCreateTreeNode = function (node){
    
        let guid = node.guid();
        let nodeType = treeViewData[guid];
        return !!nodeType;
    }
    delegate.onTreeNodeClick = (tree, node, event) => {
        panel._tryLoad(node);
    };
    delegate.createTreeNode = function(node, parent, options, type, depth) {
        const label = Autodesk.Viewing.UI.TreeDelegate.prototype.createTreeNode.call(this, node, parent, options);
        
        // Custom offset logic
        const offset = 10 + (15 * depth) + (type === 'leaf' ? 15 : 0);
        parent.style.paddingLeft = offset + 'px';

        // Add icon representing geometry or sheet when appropriate.
        if (node.isGeometry()) {

            const _document = this.getDocument();
            var geomTypeIcon = _document.createElement('geom_icon'); // Refer to the CSS property
            
            // Insert after the existing <icon>
            label.parentElement.insertBefore(geomTypeIcon, label.parentElement.children[1]);

            // Reset for geometry elements.
            parent.style.paddingTop = '0';
        }
        
        return label;
    }
    delegate.getScrollContainer = function() {
        return panel.scrollContainer;
    }

    return delegate;
}


function collectTreeViewData(rootNode) {

    // Returns a map from guid into strings 'leaf' or 'group'
    var treeViewData = {};

    rootNode.traverse((node)=>{

        if (node.isGeometry()) {
            if (node.is2D() || node.is3D()) {
                exposeTreeLeaf(treeViewData, node);
            }
        }

        if (node.isViewPreset()) {
            // For Views contained in Geometries, check for multiple views.
            // If there is only one view, make sure the name is different than
            // the parent geometry node (UX requirement).
            let parent = node.parent;
            let views = parent.search({"type":"view"});
            if (views.length > 1) {
                exposeTreeLeaf(treeViewData, node);
                return;
            }
            else if (views.length === 1) {

                // For 2D sheets don't show the view.
                if (views[0].is2D())
                    return;

                // For 3D, show the view when the name is different than the geometry's.
                const sameName = node.name() === views[0].name();
                if (!sameName) { // it's not a group if they have the same name.
                    exposeTreeLeaf(treeViewData, node);
                }
            }
        }
    });

    return treeViewData;
}



function exposeTreeLeaf(treeViewData, node) {

    var guid = node.guid();
    treeViewData[guid] = TREE_VIEW_LEAF;

    var p = node.parent;
    while (p) {
        guid = p.guid();
        treeViewData[guid] = TREE_VIEW_GROUP;
        p = p.parent;
    }
}

*/