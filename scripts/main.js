const MESH_NAME = {
  GROUND: 'ground',
  BOX: 'box',
  DONUT: 'donut',
  SPHERE: 'sphere'
}

const createBabylonEngine = (canvas) => {
  const engineOptions = {
    preserveDrawingBuffer: true,
    stencil: true
  }
  return new BABYLON.Engine(canvas, true, engineOptions);
};

const createBabylonScene = (engine) => {
  const scene = new BABYLON.Scene(engine);
  scene.collisionsEnabled = true;
  scene.clearColor = new BABYLON.Color3(0, 0, 0);
  return scene;
};

const createCamera = (scene, canvas) => {
  const camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(20, 200, 400), scene);
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.lowerBetaLimit = 0.1;
  camera.upperBetaLimit = (Math.PI / 2) * 0.99;
  camera.lowerRadiusLimit = 150;
  camera.attachControl(canvas, true);
  return camera;
};

const createLight = (scene) => {
  return new BABYLON.PointLight("omni", new BABYLON.Vector3(0, 50, 0), scene);
};

const createGroundPlane = (scene) => {
  const ground = BABYLON.Mesh.CreateGround(MESH_NAME.GROUND, 1000, 1000, 1, scene, false);
  const groundMaterial = new BABYLON.StandardMaterial(MESH_NAME.GROUND + '_mat', scene);
  groundMaterial.specularColor = BABYLON.Color3.Black();
  ground.material = groundMaterial;
};

const createSphere = (scene) => {
  const sphere = BABYLON.Mesh.CreateSphere(MESH_NAME.SPHERE, 32, 20, scene);
  const redMat = new BABYLON.StandardMaterial(MESH_NAME.SPHERE + '_mat', scene);
  redMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
  redMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
  redMat.emissiveColor = BABYLON.Color3.Red();
  sphere.material = redMat;
  sphere.position.y = 10;
  sphere.position.x -= 100;
  return sphere;
};

const createBox = (scene) => {
  const box = BABYLON.Mesh.CreateBox(MESH_NAME.BOX, 20, scene);
  const greenMat = new BABYLON.StandardMaterial(MESH_NAME.BOX + '_mat', scene);
  greenMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
  greenMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
  greenMat.emissiveColor = BABYLON.Color3.Green();
  box.material = greenMat;
  box.position.z -= 100;
  box.position.y = 10;
  return box;
};

const createDonut = (scene) => {
  const donut = BABYLON.Mesh.CreateTorus(MESH_NAME.DONUT, 20, 2, 32, scene);
  const purpleMat = new BABYLON.StandardMaterial(MESH_NAME.DONUT + '_mat', scene);
  purpleMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
  purpleMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
  purpleMat.emissiveColor = BABYLON.Color3.Purple();
  donut.material = purpleMat;
  donut.position.y = 10;
  donut.position.z += 100;
  return donut;
};

const addControl = (scene, canvas, camera) => {
  const animateObjectToPosition = function (object, speed, frameCount, newPos) {
    camera.detachControl(canvas, false);
    const ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    const anim = BABYLON.Animation.CreateAndStartAnimation('animateObjectToPosition', object, 'position', speed, frameCount,
      object.position, newPos, 0, ease, () => {
        camera.attachControl(canvas, true);
      });
    anim.disposeOnEnd = true;
    return anim;
  }

  const createCursorOnGround = (scene) => {
    const cursor = BABYLON.Mesh.CreateTorus(MESH_NAME.DONUT, 30, 10, 32, scene);
    const yellowMat = new BABYLON.StandardMaterial(MESH_NAME.DONUT + '_mat', scene);
    yellowMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    yellowMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    yellowMat.emissiveColor = BABYLON.Color3.Yellow();
    cursor.material = yellowMat;
    return cursor;
  };

  const getPositionCursorOnGround = (scene) => {
    const pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) {
      return mesh.name === MESH_NAME.GROUND
    });
    if (pickInfo.hit) {
      return pickInfo.pickedPoint;
    }

    return null;
  }
  const cursor = createCursorOnGround();
  const speed = 60;
  const frameCount = 200;
  let startPos = null;
  const onMouseDown = (evt) => {
    startPos = getPositionCursorOnGround(scene);
  }
  const onMouseMove = (e) => {
    const position = getPositionCursorOnGround(scene);
    if(!position) return;
    cursor.position.x = position.x;
    cursor.position.y = position.y;
    cursor.position.z = position.z;
  }
  const onMouseUp = (e) => {
    const position = getPositionCursorOnGround(scene);
    if(!position) return;
    const diff = startPos.subtract(position);
    console.log(diff);
    console.log(diff.length);
    if(diff.length() > 1) return;
    const newPosition = new BABYLON.Vector3(position.x, camera.position.y, position.z);
    animateObjectToPosition(camera, speed, frameCount, newPosition);
  }
  canvas.addEventListener("pointerdown", onMouseDown, false);
  canvas.addEventListener("pointermove", onMouseMove, false);
  canvas.addEventListener("pointerup", onMouseUp, false);
};

const main = () => {
  const canvas = document.getElementById('main-canvas');
  const engine = createBabylonEngine(canvas);
  const scene = createBabylonScene(engine);
  const camera = createCamera(scene, canvas);
  createLight(scene);
  createGroundPlane(scene);
  createBox(scene);
  createDonut(scene);
  createSphere(scene);
  addControl(scene, canvas, camera);
  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", function () {
    engine.resize();
  });
};

main();
