
const TREE_VIEW_LEAF = 'leaf';
const TREE_VIEW_GROUP = 'group';

/**
 * Creates a Tree delegate, used to render the Model Browser's Tree View.
 */
export function createTreeViewDelegate(rootNode, panel) {

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

/**
 * Identifies all leaf nodes and then traverses-up all parents
 * and marks them to be shown by the Tree view.
 * 
 * @param {BubbleNode} rootNode 
 */
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


/**
 * @param {Object} treeViewData - Map from guid to string
 * @param {BubbleNode} node 
 */
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

