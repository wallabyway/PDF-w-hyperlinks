    _createTreeView() {
        if (this.myTree) return;

        var rootNode = this.currNode.getRootNode();
        var delegate = createTreeViewDelegate(rootNode, this);
        var options = {
            leafClassName: 'docBrowserLeaf',
            selectedClassName: 'selected-ex',
        };

        var container = this._getTabDiv(TAB_ID_TREE);

        this.myTree = new Autodesk.Viewing.UI.Tree(
            delegate, 
            rootNode, 
            container, 
            options
        );
    }