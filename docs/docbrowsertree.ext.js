const AV = Autodesk.Viewing;

const MY_FOLDER_DATA = {
    name: 'Assembly Tree',
    entries: [
		{
			name: 'Metal Container.iam.dwfx',
			part: "ebox_example2",
			type: '3d',
			entries: [
				{
					"name": "Metal Container.idw_Sheet_1.pdf",
					"type": "2d",
				},
				{
					"name": "Metal Container.dwg_Sheet_1.pdf",
					"type": "2d",
				},
			],
		},
		{
			name: 'ebox.ipt',
			part: "CPL001grs",
			type: '3d',
			entries: [
                {
                    "name": "ebox.idw_Sheet_1.pdf",
                    "type": "2d"
                }
            ]			
		}
    ]
};

class CustomTreeDelegate extends Autodesk.Viewing.UI.TreeDelegate {
    isTreeNodeGroup(node) {
        return node.entries && node.entries.length > 0;
    }

    getTreeNodeId(node) {
        return node.path;
    }

    getTreeNodeLabel(node) {
        return node.name;
    }

    getTreeNodeClass(node) {
        node.children && node.children.length > 0 ? 'group' : 'leaf';
    }

    forEachChild(node, callback) {
        for (const child of node?.entries) {
            callback(child);
        }
    }

    onTreeNodeClick(tree, node, event) {
		const filename = event.target.children[2].textContent;
		window.location=`?url=${filename}`;
        //console.log('click', tree, node, event);
    }

    onTreeNodeDoubleClick(tree, node, event) {
        //console.log('double-click', tree, node, event);
    }

    onTreeNodeRightClick(tree, node, event) {
        //console.log('right-click', tree, node, event);
    }

    createTreeNode(node, parent, options, type, depth) {
        const label = super.createTreeNode(node, parent, options, type, depth);
        const icon = label.previousSibling;
        const row = label.parentNode;
        // Center arrow icon
        if (icon) {
            icon.style.backgroundPositionX = '5px';
            icon.style.backgroundPositionY = '5px';
        }

        // Add icon representing geometry or sheet when appropriate.
        if ((node.type == "3d") || (node.type == "2d")) {

            const _document = this.getDocument();
            var geomTypeIcon = _document.createElement('div'); // Refer to the CSS property
			geomTypeIcon.className = `icon geom${node.type}_icon`
            
            // Insert after the existing <icon>
            label.parentElement.insertBefore(geomTypeIcon, label);

            // Reset for geometry elements.
            parent.style.paddingTop = '0';
        }
		
        // Offset rows depending on their tree depth
        row.style.padding = `5px`;
        row.style.paddingLeft = `${5 + (type === 'leaf' ? 20 : 0) + depth * 20}px`;
        return label;
    }
}

export class CustomTreeViewPanel extends Autodesk.Viewing.UI.DockingPanel {
    constructor(viewer, id, title) {
        super(viewer.container, id, title);
        this.container.classList.add('property-panel'); // Re-use some handy defaults
        this.container.dockRight = true;
        this.createScrollContainer({ left: false, heightAdjustment: 70, marginTop: 0 });
        this.delegate = new CustomTreeDelegate();
        this.tree = new Autodesk.Viewing.UI.Tree(this.delegate, MY_FOLDER_DATA, this.scrollContainer);
    }
}



///////////////////////////////////////////////////////////////////
// Toolbar Button
export default class docBrowserTree extends AV.Extension {
	unload() { return true }
	async load() {
		console.log('docBrowser...loaded'); 
		// add toolbar
		await this.viewer.waitForLoadDone();
		this.addToolbarButton(this.viewer);
		return true;
	}

	addToolbarButton(viewer) {
			// add Toolbar button
			var button = new AV.UI.Button('docBrowserPanel');
			button.icon.classList.add("docbrowser_icon");
			button.setToolTip('Document Browser');
			button.onClick = function (e) {	
				this.panel.setVisible(!this.panel.isVisible());
			}.bind(this);			
			this.subToolbar = new AV.UI.ControlGroup('docBrowserToolbar');
			this.subToolbar.addControl(button);
			viewer.toolbar.addControl(this.subToolbar);

			// connect to popup Dialog
			this.panel = new CustomTreeViewPanel(viewer, viewer.container, 'Document Browser', 'Document Browser');
			this.panel.container.style.left='5px';
			this.panel.container.style.top='5px';
			this.panel.container.style.height="390px";
			this.panel.container.style.width="320px";
			this.panel.container.dockRight=false;
			this.panel.setVisible(true);

	}
}
AV.theExtensionManager.registerExtension("docBrowserTree", docBrowserTree);

