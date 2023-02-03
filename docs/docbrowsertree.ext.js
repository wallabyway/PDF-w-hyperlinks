const AV = Autodesk.Viewing;

const MY_FOLDER_DATA = {
    path: '/home',
    name: 'Home',
    entries: [
        {
            path: '/home/docs',
            name: 'Documents',
            entries: [
                {
                    name: 'Metal Container.idw_Sheet_1.pdf',
					type: '2d'
                }
            ]
        },
        {
            path: '/home/images',
            name: 'Images',
            entries: [
                {
					type: '2d',
                    name: 'ebox.idw_Sheet_1.pdf'
                },
                {
                    path: '/home/images/old',
                    name: 'Old',
                    entries: [
                        {
                            name: 'Metal Container.iam.dwfx',
							type: '3d'
                        },
                        {
                            name: 'ebox.idw_Sheet_1.pdf',
							type: '2d'
                        }                        
                    ]
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
        console.log('click', tree, node, event);
    }

    onTreeNodeDoubleClick(tree, node, event) {
        console.log('double-click', tree, node, event);
    }

    onTreeNodeRightClick(tree, node, event) {
        console.log('right-click', tree, node, event);
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

export default class docBrowser2 extends AV.Extension {
	unload() { return true }
	async load() {
		await this.viewer.waitForLoadDone();
		const nn = new CustomTreeViewPanel(this.viewer, "doc Browser", "doc Browser");
		nn.container.style.left='5px';
		nn.container.style.top='5px';
		nn.container.style.height="400px";
		nn.container.style.width="220px";
		nn.container.dockRight=false;

		nn.setVisible(true);
		return true;
	}
}

AV.theExtensionManager.registerExtension("docBrowser2", docBrowser2);