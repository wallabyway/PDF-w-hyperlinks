const AV = Autodesk.Viewing;
const HIGHLIGHT_ON = 0.3;
const HIGHLIGHT_OFF = 0.01;
const HIGHLIGHT_COLOR = 0x1f00ff;
const OVERLAY = 'bubbles-scene';

///////////////////////////////////////////////////////////////////
// load hyperlink extension 
 export default class hyperlinksPdf extends AV.Extension {
	unload() { 
		this.viewer.impl.removeOverlayScene( OVERLAY );
		return true;
	}

	async load() { 
		await this.viewer.waitForLoadDone();
		if (!this.viewer.overlays.hasScene(OVERLAY)) {
			this.viewer.overlays.addScene(OVERLAY);
		}
		this.tool = new hyperlinkTool(this.viewer);
		this.viewer.toolController.registerTool(this.tool);
		this.viewer.toolController.activateTool(OVERLAY)
		console.log('hyperlinksPdf...loaded');
		return true;
	}

}
AV.theExtensionManager.registerExtension("hyperlinksPdf", hyperlinksPdf);

///////////////////////////////////////////////////////////////////
// tool control for mouse events
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
	}

	register() {
		this.addBubble("open part3", "some3.pdf", 9.312, 14.85);
		this.addBubble("open level2", "another.pdf",  9.4414, 12.926);
		this.addBubble("open level1", "another1.pdf",  9.47, 11.4);
    }

    getPriority() {
        return 1; // Use any number higher than 0 (the priority of all default tools)
    }

	handleSingleClick(event) {
		const intersects = this.intersect(event, this.layer.scene.children);
		if (intersects[0]) alert(intersects[0].tooltip)
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

	addBubble(tooltip, url, x, y) {
		const geom = new THREE.CircleGeometry( 0.18, 32 );
		const material = new THREE.MeshBasicMaterial({ color: HIGHLIGHT_COLOR });
		material.opacity=HIGHLIGHT_OFF;
		const sphereMesh = new THREE.Mesh(geom, material);
		sphereMesh.position.set(x, y, 0);
		sphereMesh.tooltip = tooltip;
		sphereMesh.url = url;
		this.viewer.overlays.addMesh(sphereMesh, OVERLAY);
	}

}