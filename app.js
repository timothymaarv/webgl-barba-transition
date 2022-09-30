import gsap from "gsap";

import * as THREE from "three";
import * as vertexShader from "./shaders/vertex.glsl";
import * as fragmentShader from "./shaders/fragment.glsl";
import * as dat from "lil-gui";

import barba from "@barba/core";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import "./style.css";
// import texture from "./texture.jpg";
import ASScroll from "@ashthornton/asscroll";

const container = document.getElementById("container");

export default class App {
  constructor(options) {
    this.time = 0;
    this.container = options.domElement;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.camera = new THREE.PerspectiveCamera(
      70,
      this.width / this.height,
      10,
      1000
    );
    this.camera.position.z = 600;
    this.camera.fov = 2 * ((Math.atan(this.height / 2 / 600) * 180) / Math.PI); // sync webgl and html dimension

    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setAnimationLoop(this.animation);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enabled = false;

    this.materials = [];
    this.asscroll = new ASScroll({ disableRaf: true });

    this.asscroll.enable({
      horizontalScroll: !document.body.classList.contains("b-inside"),
    });

    // this.setUp();
    this.addObjects();
    this.resize();
    this.render();

    this.barba();

    window.addEventListener("resize", () => {
      this.resize();
    });
  }

  barba() {
    let that = this;
    barba.init({
      transitions: [
        {
          name: "from-home-transition",
          from: {
            namespace: ["home"],
          },
          leave(data) {
            that.asscroll.disable();
            return gsap.timeline().to(data.current.container, {
              opacity: 0,
            });
          },
          enter(data) {
            that.asscroll = new ASScroll({
              disableRaf: true,
              containerElement: data.next.container.querySelector(
                "[asscroll-container]"
              ),
            });
            that.asscroll.enable({
              newScrollElements:
                data.next.container.querySelector(".scroll-wrap"),
            });
            return gsap.timeline().from(data.next.container, {
              opacity: 0,
              onComplete: () => {
                that.container.style.display = "none";
              },
            });
          },
        },
        {
          name: "from-inside-page-transition",
          from: {
            namespace: ["inside"],
          },
          leave(data) {
            that.asscroll.disable();
            return gsap
              .timeline()
              .to(".curtain", {
                duration: 0.3,
                y: 0,
              })
              .to(data.current.container, {
                opacity: 0,
              });
          },
          enter(data) {
            that.imageStore.forEach((m) => {
              that.scene.remove(m.mesh);
            });

            that.imageStore = [];
            that.materials = [];
            that.resize();
            that.addObjects();
            that.container.style.visibility = "visible";

            that.asscroll = new ASScroll({
              disableRaf: true,
              containerElement: data.next.container.querySelector(
                "[asscroll-container]"
              ),
            });
            that.asscroll.enable({
              horizontalScroll: true,
              newScrollElements:
                data.next.container.querySelector(".scroll-wrap"),
            });

            return gsap
              .timeline()
              .to(".curtain", {
                duration: 0.3,
                y: "-100%",
              })
              .from(data.next.container, {
                opacity: 0,
              });
          },
        },
      ],
    });
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.camera.fov = 2 * ((Math.atan(this.height / 2 / 600) * 180) / Math.PI); // sync webgl and html dimension

    this.materials.forEach((material) => {
      material.uniforms.uResolution.value.x = this.width;
      material.uniforms.uResolution.value.y = this.height;
    });

    this.imageStore.forEach((item) => {
      let bounds = item.img.getBoundingClientRect();
      const { width, height, top, left } = bounds;
      item.mesh.scale.set(width, height, 1);

      item.top = top;
      item.left = left + this.asscroll.currentPos;

      item.width = bounds.width;
      item.height = bounds.height;

      item.mesh.material.uniforms.uQuadSize.value.x = width;
      item.mesh.material.uniforms.uQuadSize.value.y = height;

      item.mesh.material.uniforms.uTextureSize.value.x = width;
      item.mesh.material.uniforms.uTextureSize.value.y = height;
    });
  }

  addObjects() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 100, 100);

    // this.geometry = new THREE.SphereGeometry(0.3, 100, 100);

    // this.material = new THREE.MeshNormalMaterial({ wireframe: false });
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 1.0 },
        uResolution: { value: new THREE.Vector2(this.width, this.height) },
        uTextureSize: { value: new THREE.Vector2(100, 100) },
        uQuadSize: { value: new THREE.Vector2(300, 300) },
        uCorners: { value: new THREE.Vector4(0, 0, 0, 0) },
        uTexture: { value: undefined },
        uProgress: { value: 0 },
      },
      side: THREE.DoubleSide,
      wireframe: false,
      vertexShader,
      fragmentShader,
    });

    this.tl = gsap
      .timeline()
      .to(this.material.uniforms.uCorners.value, { x: 1, duration: 1 })
      .to(this.material.uniforms.uCorners.value, { y: 1, duration: 1 }, 0.1)
      .to(this.material.uniforms.uCorners.value, { z: 1, duration: 1 }, 0.2)
      .to(this.material.uniforms.uCorners.value, { w: 1, duration: 1 }, 0.3);

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.scale.set(300, 300, 1);
    this.mesh.position.x = 300;
    // this.mesh.rotation.z = 0.5;
    // this.scene.add(this.mesh);

    this.images = [...document.querySelectorAll(".js-image")];
    this.imageStore = this.images.map((img) => {
      let material = this.material.clone(); // clone material
      this.materials.push(material);
      let bounds = img.getBoundingClientRect();
      const { top, left, width, height } = bounds;

      let texture = new THREE.TextureLoader().load(img.src);

      material.uniforms.uTexture.value = texture;

      img.addEventListener("click", () => {
        localStorage.setItem("clicked", img.src);
        this.tl = gsap
          .timeline()
          .to(material.uniforms.uCorners.value, { x: 1, duration: 0.5 })
          .to(material.uniforms.uCorners.value, { y: 1, duration: 0.5 }, 0.1)
          .to(material.uniforms.uCorners.value, { z: 1, duration: 0.5 }, 0.2)
          .to(material.uniforms.uCorners.value, { w: 1, duration: 0.5 }, 0.3);
      });

      // img.addEventListener("mouseout", () => {
      //   this.tl = gsap
      //     .timeline()
      //     .to(material.uniforms.uCorners.value, { x: 0, duration: 1 })
      //     .to(material.uniforms.uCorners.value, { y: 0, duration: 1 }, 0.2)
      //     .to(material.uniforms.uCorners.value, { z: 0, duration: 1 }, 0.4)
      //     .to(material.uniforms.uCorners.value, { w: 0, duration: 1 }, 0.6);
      // });

      let mesh = new THREE.Mesh(this.geometry, material);
      mesh.scale.set(width, height, 1);

      this.scene.add(mesh);

      return {
        img: img,
        mesh: mesh,
        width,
        height,
        top,
        left,
      };
    });
  }

  setUp() {
    this.settings = {
      progress: 0,
    };

    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.001);
  }

  setPosition() {
    this.imageStore.forEach((o) => {
      o.mesh.position.x =
        -this.asscroll.currentPos + o.left - this.width / 2 + o.width / 2;
      o.mesh.position.y = -o.top + this.height / 2 - o.height / 2;
    });
  }

  render() {
    this.time += 0.05;
    this.material.uniforms.time.value = this.time;
    // this.material.uniforms.uProgress.value = this.settings.progress;
    this.mesh.rotation.x = this.time / 2000;
    this.mesh.rotation.y = this.time / 1000;

    this.setPosition();
    this.asscroll.update();
    // this.tl.progress(this.settings.progress);

    this.controls.update();

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.render.bind(this)); // bind so we have access to the variable inside the function
  }
}

new App({
  domElement: container,
});
