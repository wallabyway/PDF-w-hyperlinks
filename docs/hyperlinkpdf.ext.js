// PURPOSE: Extension adds hyperlinks to 2D PDF (called bubbles in Inventor).
// When a bubble is clicked a custom context-menu popup appears, which opens other 2D/3D drawings

const AV = Autodesk.Viewing;
const HIGHLIGHT_ON = 0.3;
const HIGHLIGHT_OFF = 0.01;
const HIGHLIGHT_COLOR = 0x1f00ff;
const OVERLAY = 'bubbles-scene';
const BUBBLE_RADIUS = 0.18;

///////////////////////////////////////////////////////////////////
// load hyperlink extension 
 export default class hyperlinksPdf extends AV.Extension {
	unload() { 
		this.viewer.impl.removeOverlayScene( OVERLAY );
		return true;
	}

	async load() { 
		await this.viewer.waitForLoadDone();

		// load bubble module
		if (!this.viewer.overlays.hasScene(OVERLAY)) {
			this.viewer.overlays.addScene(OVERLAY);
		}
		this.tool = new hyperlinkTool(this.viewer);
		this.viewer.toolController.registerTool(this.tool);
		this.viewer.toolController.activateTool(OVERLAY);

		console.log('hyperlinksPdf...loaded');
		return true;
	}

}
AV.theExtensionManager.registerExtension("hyperlinksPdf", hyperlinksPdf);

///////////////////////////////////////////////////////////////////
// Custom Context Menu
class CMenuExtension extends Autodesk.Viewing.UI.ObjectContextMenu {
	constructor(opts) {
		super(opts);
	};

	buildMenu(event, node) {
		var menu = [];
		this.name = "lalala";
		this.dbid = 123;
		menu.push({
			title: `open part ${event.partID}`,
			className: 'navbar',
			target: (e) => this.launchView(event)
		}, {
			title: `Hide 123 ${event.url}`,
			className: 'navbar disabled',
			target: (e) => viewer.hide(event.partID)
		});
		return menu;
	}

	launchView(event) {
		AV.Document.load(`${event.url}`, async (doc) => {
			var viewables = doc.getRoot().getDefaultGeometry();
			this.viewer.loadDocumentNode(doc, viewables);
			await this.viewer.waitForLoadDone();
			this.viewer.isolate(event.partID);
			this.viewer.fitToView(event.partID);
		});
	}
}

///////////////////////////////////////////////////////////////////
// Add Hyperlinks to Canvas.  Bubbles are made of 3js circle geometry. Hit test via a ToolInterface mouse events
class hyperlinkTool extends Autodesk.Viewing.ToolInterface {
    constructor(viewer) {
        super();
		delete this.register;
        delete this.getPriority;
        delete this.handleMouseMove;
        delete this.handleSingleClick;
		this.names = [OVERLAY];
		this.viewer = viewer;
		this.layer = this.viewer.overlays.impl.overlayScenes[OVERLAY];

		// load custom context menu module
		this.menu = new CMenuExtension(this.viewer);//new Autodesk.Viewing.UI.ObjectContextMenu(this.viewer);
		this.viewer.setContextMenu(this.menu);		
	}

	register() {
		this.addBubble(10, "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6c2YtYWNjZWwtMS9NZXRhbCUyMENvbnRhaW5lci5kd2Y", 9.312, 14.85);
		this.addBubble("level2123", "another.pdf",  9.4414, 12.926);
		this.addBubble("level1456", "another1.pdf",  9.47, 11.4);
    }

    getPriority() {
        return 1; // Use any number higher than 0 (the priority of all default tools)
    }

	handleSingleClick(event) {
		const intersects = this.intersect(event, this.layer.scene.children);
		if (intersects[0]) {
			console.log(intersects[0].partID);
			event.partID = intersects[0].partID;
			event.url = intersects[0].url;
			this.menu.show(event);
		}
        return false;
    };

	handleMouseMove(event) {
		const intersects = this.intersect(event, this.layer.scene.children);
		this.setHighlight(intersects);
		return false;
    }

	intersect(event, objects) {
		var vpVec = this.viewer.impl.clientToViewport(event.canvasX, event.canvasY);
		let point = this.viewer.impl.intersectGroundViewport(vpVec);
		return objects.filter( i => { return point.distanceTo(i.position) <= i.geometry.boundingSphere.radius; })
	}

	setHighlight(mesh) {
		if (this.prevCurs ) {
			this.prevCurs.material.opacity=HIGHLIGHT_OFF;
		}
		if (mesh.length > 0) {
			this.prevCurs = mesh[0];
			mesh[0].material.opacity=HIGHLIGHT_ON;
		}
		this.viewer.impl.invalidate(true);
	}

	addBubble(partID, url, x, y) {
		const geom = new THREE.CircleGeometry( BUBBLE_RADIUS, 32 );
		const material = new THREE.MeshBasicMaterial({ color: HIGHLIGHT_COLOR });
		material.opacity=HIGHLIGHT_OFF;
		const sphereMesh = new THREE.Mesh(geom, material);
		sphereMesh.position.set(x, y, 0);
		sphereMesh.partID = partID;
		sphereMesh.url = url;
		this.viewer.overlays.addMesh(sphereMesh, OVERLAY);
	}

}