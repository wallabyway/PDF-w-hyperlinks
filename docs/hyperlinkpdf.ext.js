// PURPOSE: Extension adds hyperlinks to 2D PDF (called bubbles in Inventor).
// When a bubble is clicked a custom context-menu popup appears, which opens other 2D/3D drawings

const AV = Autodesk.Viewing;
const HIGHLIGHT_ON = 0.3;
const HIGHLIGHT_OFF = 0.01;
const HIGHLIGHT_COLOR = 0x1f00ff;
const OVERLAY = 'bubbles-scene';
const BUBBLE_RADIUS = 0.18;
const dataFolder = "data";	

///////////////////////////////////////////////////////////////////
// load hyperlink extension 
 export default class hyperlinksPdf extends AV.Extension {
	unload() { 
		this.viewer.impl.removeOverlayScene( OVERLAY );
		this.viewer.toolController.unregisterTool(this.tool);
		this.tool = null;
		return true;
	}

	async load() { 
		await this.viewer.waitForLoadDone();
		
		// load bubble module
		if (!this.viewer.overlays.hasScene(OVERLAY)) {
			this.viewer.overlays.addScene(OVERLAY);
		}
		if (!this.tool) { 
			// load custom context menu module
			this.menu = new CMenuExtension(this.viewer);
			//this.viewer.setContextMenu(this.menu);		

			this.tool = new hyperlinkTool(this.viewer, this.menu);
			this.viewer.toolController.registerTool(this.tool);
			this.viewer.toolController.activateTool(OVERLAY);
		}

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
		if (!event.partObj) return menu;
		event.partObj.map( part => {
			menu.push({
				title: `Open ${part.type} Part "${part.name}"`,
				className: 'navbar',
				target: (e) => this.launchView(part)
			})
		});
		return menu;
	}

	async launchView(part) {
		console.log(part.type);
		if (part.type=="3d") {
			// AV.Document.load(`urn:${part.urn}`, async (doc) => {
			// 	var viewables = doc.getRoot().getDefaultGeometry();
			// 	this.viewer.loadDocumentNode(doc, viewables);
			// 	await this.viewer.waitForLoadDone();
			// 	this.viewer.isolate(part.dbid);
			// 	this.viewer.fitToView(part.dbid);
			// });

			await this.viewer.unloadModel();
			this.viewer.loadModel(`${dataFolder}/${part.url}`, {keepCurrentModels:false});
			await this.viewer.waitForLoadDone();
			viewer.search(part.name, (results)=>{
				viewer.isolate(results);
				this.viewer.fitToView(presults);
			}, null, ['Part Number']);
			
		} else {
			// load PDF
			await this.viewer.unloadModel();
			this.viewer.loadModel(`${dataFolder}/${part.url}`, {keepCurrentModels:false});
		}
	}
}

///////////////////////////////////////////////////////////////////
// Add Hyperlinks to Canvas.  Bubbles are made of 3js circle geometry. Hit test via a ToolInterface mouse events
class hyperlinkTool extends Autodesk.Viewing.ToolInterface {
    constructor(viewer, menu) {
        super();
		delete this.register;
        delete this.getPriority;
        delete this.handleMouseMove;
        delete this.handleSingleClick;
		this.names = [OVERLAY];
		this.viewer = viewer;
		this.menu = menu;
		this.layer = this.viewer.overlays.impl.overlayScenes[OVERLAY];
	}

	register() {
		this.addBubble(9.312, 14.85, [
			{ type:"3d", name:"CPL001grs", url:"Metal Container.iam.dwfx"},
			{ type:"2d", name:"ebox", url:"ebox.idw_Sheet_1.pdf"}
		]);
		
		this.addBubble(9.471, 11.41, [{ type:"2d", name:"ebox", url:"ebox.idw_Sheet_1.pdf"}]);
    }

    getPriority() {
        return 1; // Use any number higher than 0 (the priority of all default tools)
    }

	handleSingleClick(event) {
		const intersects = this.intersect(event, this.layer.scene.children);
		if (intersects[0]) {
			event.partObj = intersects[0].partObj;
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

	addBubble(x, y, partObj) {
		const geom = new THREE.CircleGeometry( BUBBLE_RADIUS, 32 );
		const material = new THREE.MeshBasicMaterial({ color: HIGHLIGHT_COLOR });
		material.opacity=HIGHLIGHT_OFF;
		const sphereMesh = new THREE.Mesh(geom, material);
		sphereMesh.position.set(x, y, 0);
		sphereMesh.partObj = partObj;
		this.viewer.overlays.addMesh(sphereMesh, OVERLAY);
	}

}