import { tiny, defs } from "./assignment-4-resources.js";
// Pull these names into this module's scope for convenience:
const {
  Vec,
  Mat,
  Mat4,
  Color,
  Light,
  Shape,
  Shader,
  Material,
  Texture,
  Scene,
  Canvas_Widget,
  Code_Widget,
  Text_Widget
} = tiny;
const { Cube, Subdivision_Sphere, Transforms_Sandbox_Base } = defs;

// Now we have loaded everything in the files tiny-graphics.js, tiny-graphics-widgets.js, and assignment-4-resources.js.
// This yielded "tiny", an object wrapping the stuff in the first two files, and "defs" for wrapping all the rest.

// (Can define Main_Scene's class here)

const Main_Scene = class Solar_System extends Scene {
  // **Solar_System**:  Your Assingment's Scene.
  constructor() {
    // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
    super();
    // At the beginning of our program, load one of each of these shape
    // definitions onto the GPU.  NOTE:  Only do this ONCE per shape.
    // Don't define blueprints for shapes in display() every frame.
    const Subdivision_Sphere_Flat = Subdivision_Sphere.prototype.make_flat_shaded_version();
    // TODO (#1):  Complete this list with any additional shapes you need.
    this.shapes = {
      box: new Cube(),
      ball_1: new Subdivision_Sphere(1),
      ball_2: new Subdivision_Sphere(2),
      ball_3: new Subdivision_Sphere_Flat(3),
      ball_4: new Subdivision_Sphere(4),
      ball_5: new Subdivision_Sphere(5),
      ball_6: new Subdivision_Sphere(6),
      star: new Planar_Star()
    };

    // TODO (#1d): Modify one sphere shape's existing texture
    // coordinates in place.  Multiply them all by 5.
    this.shapes["ball_5"].arrays.texture_coord.forEach(coord => {
      coord.scale(5);
    });

    // *** Shaders ***

    // NOTE: The 2 in each shader argument refers to the max
    // number of lights, which must be known at compile time.

    // A simple Phong_Blinn shader without textures:
    const phong_shader = new defs.Phong_Shader(2);
    // Adding textures to the previous shader:
    const texture_shader = new defs.Textured_Phong(2);
    // Same thing, but with a trick to make the textures
    // seemingly interact with the lights:
    const texture_shader_2 = new defs.Fake_Bump_Map(2);
    // A Simple Gouraud Shader that you will implement:
    const gouraud_shader = new Gouraud_Shader(2);
    // Extra credit shaders:
    const black_hole_shader = new Black_Hole_Shader();
    const sun_shader = new Sun_Shader();

    const funny_shader = new defs.Funny_Shader();

    // *** Materials: *** wrap a dictionary of "options" for a shader.

    // TODO (#2):  Complete this list with any additional materials you need:

    this.materials = {
      plastic: new Material(phong_shader, {
        ambient: 0,
        diffusivity: 1,
        specularity: 0,
        color: Color.of(1, 0.5, 1, 1)
      }),
      plastic_stars: new Material(texture_shader_2, {
        texture: new Texture("assets/stars.png"),
        ambient: 0,
        diffusivity: 1,
        specularity: 0,
        color: Color.of(0.4, 0.4, 0.4, 1)
      }),
      metal: new Material(phong_shader, {
        ambient: 0,
        diffusivity: 1,
        specularity: 1,
        color: Color.of(1, 0.5, 1, 1)
      }),
      metal_earth: new Material(texture_shader_2, {
        texture: new Texture("assets/earth.gif"),
        ambient: 0,
        diffusivity: 1,
        specularity: 1,
        color: Color.of(0.4, 0.4, 0.4, 1)
      }),
      black_hole: new Material(black_hole_shader),
      sun: new Material(sun_shader, {
        ambient: 1,
        color: Color.of(0, 0, 0, 1)
      }),
      rock: new Material(phong_shader, {
        color: Color.of(0.62, 0.62, 0.62, 1),
        diffusivity: 1,
        specularity: 0
      }),
      black_mirror: new Material(phong_shader, {
        color: Color.of(0.38, 0.38, 0.38, 1),
        specularity: 1,
        diffusivity: 0
      }),
      earth: new Material(texture_shader, {
        texture: new Texture("assets/earth.gif"),
        diffusivity: 1,
        color: Color.of(0.62, 0.62, 0.62, 1)
      }),
      brick: new Material(texture_shader_2, {
        texture: new Texture("assets/bricks.png", "NEAREST"),
        diffusivity: 1,
        specularity: 1,
        smoothness: 10
      }),
      brick2: new Material(texture_shader_2, {
        texture: new Texture("assets/bricks.png"),
        diffusivity: 1,
        specularity: 1,
        smoothness: 10
      }),
      star: new Material(texture_shader, {
        texture: new Texture("assets/star_face.png"),
        diffusivity: 0,
        specularity: 0,
        ambient: 1
      }),
      ice: new Material(gouraud_shader, {
        color: Color.of(1, 1, 1, 1),
        diffusivity: 1,
        specularity: 0.5
      })
    };

    // Some setup code that tracks whether the "lights are on" (the stars), and also
    // stores 30 random location matrices for drawing stars behind the solar system:
    this.lights_on = false;
    this.star_matrices = [];
    for (let i = 0; i < 30; i++)
      this.star_matrices.push(
        Mat4.rotation((Math.PI / 2) * (Math.random() - 0.5), Vec.of(0, 1, 0))
          .times(
            Mat4.rotation(
              (Math.PI / 2) * (Math.random() - 0.5),
              Vec.of(1, 0, 0)
            )
          )
          .times(Mat4.translation([0, 0, -150]))
      );
  }
  make_control_panel() {
    // make_control_panel(): Sets up a panel of interactive HTML elements, including
    // buttons with key bindings for affecting this scene, and live info readouts.
    // TODO (#5b): Add a button control.  Provide a callback that flips the boolean value of "this.lights_on".
    this.key_triggered_button("Lights on/off", ["l"], () => {
      this.lights_on = !this.lights_on;
    });
  }
  display(context, program_state) {
    // display():  Called once per frame of animation.  For each shape that you want to
    // appear onscreen, place a .draw() call for it inside.  Each time, pass in a
    // different matrix value to control where the shape appears.

    // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
    if (!context.scratchpad.controls) {
      // Add a movement controls panel to the page:
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls())
      );

      // Add a helper scene / child scene that allows viewing each moving body up close.
      this.children.push((this.camera_teleporter = new Camera_Teleporter()));

      // Define the global camera and projection matrices, which are stored in program_state.  The camera
      // matrix follows the usual format for transforms, but with opposite values (cameras exist as
      // inverted matrices).  The projection matrix follows an unusual format and determines how depth is
      // treated when projecting 3D points onto a plane.  The Mat4 functions perspective() and
      // orthographic() automatically generate valid matrices for one.  The input arguments of
      // perspective() are field of view, aspect ratio, and distances to the near plane and far plane.
      program_state.set_camera(
        Mat4.look_at(Vec.of(0, 10, 20), Vec.of(0, 0, 0), Vec.of(0, 1, 0))
      );
      this.initial_camera_location = program_state.camera_inverse;
      program_state.projection_transform = Mat4.perspective(
        Math.PI / 4,
        context.width / context.height,
        1,
        200
      );
    }

    // Find how much time has passed in seconds; we can use
    // time as an input when calculating new transforms:
    const t = program_state.animation_time / 1000;

    // Have to reset this for each frame:
    this.camera_teleporter.cameras = [];
    this.camera_teleporter.cameras.push(
      Mat4.look_at(Vec.of(0, 10, 20), Vec.of(0, 0, 0), Vec.of(0, 1, 0))
    );

    // Variables that are in scope for you to use:
    // this.shapes: Your shapes, defined above.
    // this.materials: Your materials, defined above.
    // this.lights:  Assign an array of Light objects to this to light up your scene.
    // this.lights_on:  A boolean variable that changes when the user presses a button.
    // this.camera_teleporter: A child scene that helps you see your planets up close.
    //                         For this to work, you must push their inverted matrices
    //                         into the "this.camera_teleporter.cameras" array.
    // t:  Your program's time in seconds.
    // program_state:  Information the shader needs for drawing.  Pass to draw().
    // context:  Wraps the WebGL rendering context shown onscreen.  Pass to draw().

    /**********************************
      Start coding down here!!!!
      **********************************/

    const blue = Color.of(0, 0, 0.5, 1),
      yellow = Color.of(0.5, 0.5, 0, 1);

    // Variable model_transform will be a local matrix value that helps us position shapes.
    // It starts over as the identity every single frame - coordinate axes at the origin.
    let model_transform = Mat4.identity();

    // TODO (#3b):  Use the time-varying value of sun_size to create a scale matrix
    // for the sun. Also use it to create a color that turns redder as sun_size
    // increases, and bluer as it decreases.
    const smoothly_varying_ratio = 0.5 + 0.5 * Math.sin((2 * Math.PI * t) / 10),
      sun_size = 1 + 2 * smoothly_varying_ratio,
      sun = model_transform.times(Mat4.scale([sun_size, sun_size, sun_size])),
      sun_color = Color.of(
        smoothly_varying_ratio,
        smoothly_varying_ratio,
        1 - smoothly_varying_ratio,
        1
      );

    this.materials.sun.color = sun_color; // Assign our current sun color to the existing sun material.

    // *** Lights: *** Values of vector or point lights.  They'll be consulted by
    // the shader when coloring shapes.  See Light's class definition for inputs.

    // TODO (#3c):  Replace with a point light located at the origin, with the sun's color
    // (created above).  For the third argument pass in the point light's size.  Use
    // 10 to the power of sun_size.
    program_state.lights = [
      new Light(Vec.of(0, 0, 0, 1), sun_color, 10 ** sun_size)
    ];

    // TODO (#5c):  Throughout your program whenever you use a material (by passing it into draw),
    // pass in a modified version instead.  Call .override( modifier ) on the material to
    // generate a new one that uses the below modifier, replacing the ambient term with a
    // new value based on our light switch.
    const modifier = this.lights_on ? { ambient: 0.3 } : { ambient: 0.0 };

    // TODO (#3d):   Draw the sun using its matrix (crated by you above) and material.
    this.shapes["ball_6"].draw(context, program_state, sun, this.materials.sun);

    // TODO (#4d1):  Draw planet 1 orbiting at 5 units radius, revolving AND rotating at 1 radian/sec.
    let planet_1_angle = t;
    let planet_1_transform = model_transform;
    planet_1_transform = planet_1_transform
      .times(Mat4.rotation(planet_1_angle, [0, 1, 0]))
      .times(Mat4.translation([5, 0, 0]))
      .times(Mat4.rotation(planet_1_angle, [0, 1, 0]));
    this.shapes["ball_3"].draw(
      context,
      program_state,
      planet_1_transform,
      this.materials.rock.override(modifier)
    );

    // TODO (#4d2):  Draw planet 2 orbiting 3 units farther, revolving AND rotating slower.
    let planet_2_angle = t / 2;
    let planet_2_transform = model_transform;
    planet_2_transform = planet_2_transform
      .times(Mat4.rotation(planet_2_angle, [0, 1, 0]))
      .times(Mat4.translation([8, 0, 0]))
      .times(Mat4.rotation(planet_2_angle, [0, 1, 0]));
    this.shapes["ball_2"].draw(
      context,
      program_state,
      planet_2_transform,
      this.materials.black_mirror.override(modifier)
    );

    // TODO (#6b1):  Draw moon 1 orbiting 2 units away from planet 2, revolving AND rotating.
    let moon_1_angle = t / 2;
    let moon_1_transform = planet_2_transform.times(
      Mat4.rotation(-planet_2_angle, [0, 1, 0])
    );
    moon_1_transform = moon_1_transform
      .times(Mat4.rotation(moon_1_angle, [0, 1, 0]))
      .times(Mat4.translation([2, 0, 0]))
      .times(Mat4.rotation(moon_1_angle, [0, 1, 0]));
    this.shapes["ball_6"].draw(
      context,
      program_state,
      moon_1_transform,
      this.materials.black_hole.override(modifier)
    );

    // TODO (#4d3):  Draw planet 3 orbiting 3 units farther, revolving AND rotating slower.
    let planet_3_angle = t / 4;
    let planet_3_transform = model_transform;
    planet_3_transform = planet_3_transform
      .times(Mat4.rotation(planet_3_angle, [0, 1, 0]))
      .times(Mat4.translation([11, 0, 0]))
      .times(Mat4.rotation(planet_3_angle, [0, 1, 0]));
    this.shapes["ball_4"].draw(
      context,
      program_state,
      planet_3_transform,
      this.materials.earth.override(modifier)
    );
    // TODO (#6b2):  Draw moon 2 orbiting 2 units away from planet 3, revolving AND rotating.
    let moon_2_angle = t / 4;
    let moon_2_transform = planet_3_transform.times(
      Mat4.rotation(-planet_3_angle, [0, 1, 0])
    );
    moon_2_transform = moon_2_transform
      .times(Mat4.rotation(moon_2_angle, [0, 1, 0]))
      .times(Mat4.translation([2, 0, 0]))
      .times(Mat4.rotation(moon_2_angle, [0, 1, 0]));
    this.shapes["ball_1"].draw(
      context,
      program_state,
      moon_2_transform,
      this.materials.ice.override(modifier)
    );

    // TODO (#4d4):  Draw planet 4
    let planet_4_angle = t / 8;
    let planet_4_transform = model_transform;
    planet_4_transform = planet_4_transform
      .times(Mat4.rotation(planet_4_angle, [0, 1, 0]))
      .times(Mat4.translation([14, 0, 0]))
      .times(Mat4.rotation(planet_4_angle, [0, 1, 0]));
    this.shapes["ball_5"].draw(
      context,
      program_state,
      planet_4_transform,
      this.materials.brick.override(modifier)
    );

    // TODO (#4d5):  Draw planet 5
    let planet_5_angle = t / 16;
    let planet_5_transform = model_transform;
    planet_5_transform = planet_5_transform
      .times(Mat4.rotation(planet_5_angle, [0, 1, 0]))
      .times(Mat4.translation([17, 0, 0]))
      .times(Mat4.rotation(planet_5_angle, [0, 1, 0]));
    this.shapes["ball_5"].draw(
      context,
      program_state,
      planet_5_transform,
      this.materials.brick2.override(modifier)
    );

    // TODO (#5a): If the light switch is on, loop through star_matrices and draw 2D stars.
    if (this.lights_on) {
      this.star_matrices.forEach(star_matrix => {
        this.shapes["star"].draw(
          context,
          program_state,
          star_matrix,
          this.materials.star
        );
      });
    }

    // TODO (#7b): Give the child scene (camera_teleporter) the *inverted* matrices
    // for each of your objects, mimicking the examples above.  Tweak each
    // matrix a bit so you can see the planet, or maybe appear to be standing
    // on it.  Remember the moons.
    this.camera_teleporter.cameras.push(
      Mat4.inverse(sun.times(Mat4.translation([0, 0, 3])))
    );
    this.camera_teleporter.cameras.push(
      Mat4.inverse(
        planet_1_transform
          .times(Mat4.rotation(-planet_1_angle, [0, 1, 0]))
          .times(Mat4.translation([0, 0, 3]))
      )
    );
    this.camera_teleporter.cameras.push(
      Mat4.inverse(
        planet_2_transform
          .times(Mat4.rotation(-planet_2_angle, [0, 1, 0]))
          .times(Mat4.translation([0, 0, 3]))
      )
    );

    this.camera_teleporter.cameras.push(
      Mat4.inverse(
        moon_1_transform
          .times(Mat4.rotation(-moon_1_angle, [0, 1, 0]))
          .times(Mat4.translation([0, 0, 4]))
      )
    );

    this.camera_teleporter.cameras.push(
      Mat4.inverse(
        planet_3_transform
          .times(Mat4.rotation(-planet_3_angle, [0, 1, 0]))
          .times(Mat4.translation([0, 0, 3]))
      )
    );
    this.camera_teleporter.cameras.push(
      Mat4.inverse(
        moon_2_transform
          .times(Mat4.rotation(-moon_2_angle, [0, 1, 0]))
          .times(Mat4.translation([0, 0, 3]))
      )
    );
    this.camera_teleporter.cameras.push(
      Mat4.inverse(
        planet_4_transform
          .times(Mat4.rotation(-planet_4_angle, [0, 1, 0]))
          .times(Mat4.translation([0, 0, 3]))
      )
    );
    this.camera_teleporter.cameras.push(
      Mat4.inverse(
        planet_5_transform
          .times(Mat4.rotation(-planet_5_angle, [0, 1, 0]))
          .times(Mat4.translation([0, 0, 3]))
      )
    );

    // ***** BEGIN TEST SCENE *****
    // TODO:  Delete (or comment out) the rest of display(), starting here:

    //       program_state.set_camera( Mat4.translation([ 0,3,-10 ]) );
    //       const angle = Math.sin( t );
    //       const light_position = Mat4.rotation( angle, [ 1,0,0 ] ).times( Vec.of( 0,-1,1,0 ) );

    //       program_state.lights = [ new Light( Vec.of(0, -1, -1, 0), sun_color, 10**sun_size ) ];
    //       model_transform = Mat4.identity();
    //       this.shapes['ball_6'].draw( context, program_state, sun, this.materials.sun );
    //       model_transform.post_multiply( Mat4.translation([ 0, -2, 0 ]) );
    //       this.shapes.ball_4.draw( context, program_state, model_transform, this.materials.metal_earth.override( blue ) );
    //       model_transform.post_multiply( Mat4.rotation( t, Vec.of( 0,1,0 ) ) )
    //       model_transform.post_multiply( Mat4.rotation( 1, Vec.of( 0,0,1 ) )
    //                              .times( Mat4.scale      ([ 1,   2, 1 ]) )
    //                              .times( Mat4.translation([ 0,-1.5, 0 ]) ) );
    //       this.shapes.box.draw( context, program_state, model_transform, this.materials.plastic_stars.override( yellow ) );

    // ***** END TEST SCENE *****

    // Warning: Get rid of the test scene, or else the camera position and movement will not work.
  }
};

const Additional_Scenes = [];

export {
  Main_Scene,
  Additional_Scenes,
  Canvas_Widget,
  Code_Widget,
  Text_Widget,
  defs
};

const Camera_Teleporter = (defs.Camera_Teleporter = class Camera_Teleporter extends Scene {
  // **Camera_Teleporter** is a helper Scene meant to be added as a child to
  // your own Scene.  It adds a panel of buttons.  Any matrices externally
  // added to its "this.cameras" can be selected with these buttons. Upon
  // selection, the program_state's camera matrix slowly (smoothly)
  // linearly interpolates itself until it matches the selected matrix.
  constructor() {
    super();
    this.cameras = [];
    this.selection = 0;
  }
  make_control_panel() {
    // make_control_panel(): Sets up a panel of interactive HTML elements, including
    // buttons with key bindings for affecting this scene, and live info readouts.

    this.key_triggered_button("Enable", ["e"], () => (this.enabled = true));
    this.key_triggered_button(
      "Disable",
      ["Shift", "E"],
      () => (this.enabled = false)
    );
    this.new_line();
    this.key_triggered_button("Previous location", ["g"], this.decrease);
    this.key_triggered_button("Next", ["h"], this.increase);
    this.new_line();
    this.live_string(box => {
      box.textContent = "Selected camera location: " + this.selection;
    });
  }
  increase() {
    this.selection = Math.min(
      this.selection + 1,
      Math.max(this.cameras.length - 1, 0)
    );
  }
  decrease() {
    this.selection = Math.max(this.selection - 1, 0);
  } // Don't allow selection of negative indices.
  display(context, program_state) {
    const desired_camera = this.cameras[this.selection];
    if (!desired_camera || !this.enabled) return;
    const dt = program_state.animation_delta_time;
    program_state.set_camera(
      desired_camera.map((x, i) =>
        Vec.from(program_state.camera_inverse[i]).mix(x, 0.01 * dt)
      )
    );
  }
});

const Planar_Star = (defs.Planar_Star = class Planar_Star extends Shape {
  // **Planar_Star** defines a 2D five-pointed star shape.  The star's inner
  // radius is 4, and its outer radius is 7.  This means the complete star
  // fits inside a 14 by 14 sqaure, and is centered at the origin.
  constructor() {
    super("position", "normal", "texture_coord");

    this.arrays.position.push(Vec.of(0, 0, 0));
    for (let i = 0; i < 11; i++) {
      const spin = Mat4.rotation((i * 2 * Math.PI) / 10, Vec.of(0, 0, -1));

      const radius = i % 2 ? 4 : 7;
      const new_point = spin.times(Vec.of(0, radius, 0, 1)).to3();

      this.arrays.position.push(new_point);
      if (i > 0) this.indices.push(0, i, i + 1);
    }

    this.arrays.normal = this.arrays.position.map(p => Vec.of(0, 0, -1));

    // TODO (#5a):  Fill in some reasonable texture coordinates for the star:
    this.arrays.texture_coord = this.arrays.position.map(p => {
      let vec = p.plus(Vec.of(7, 7)).times(1 / 14);
      return Vec.of(vec[0], vec[1]);
    });
  }
});

const Gouraud_Shader = (defs.Gouraud_Shader = class Gouraud_Shader extends defs.Phong_Shader {
  shared_glsl_code() {
    // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    // TODO (#6b2.1):  Copy the Phong_Shader class's implementation of this function, but
    // change the two "varying" vec3s declared in it to just one vec4, called color.
    // REMEMBER:
    // **Varying variables** are passed on from the finished vertex shader to the fragment
    // shader.  A different value of a "varying" is produced for every single vertex
    // in your array.  Three vertices make each triangle, producing three distinct answers
    // of what the varying's value should be.  Each triangle produces fragments (pixels),
    // and the per-fragment shader then runs.  Each fragment that looks up a varying
    // variable will pull its value from the weighted average of the varying's value
    // from the three vertices of its triangle, weighted according to how close the
    // fragment is to each extreme corner point (vertex).

    // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    return (
      ` precision mediump float;
        const int N_LIGHTS = ` +
      this.num_lights +
      `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;

                              // Specifier "varying" means a variable's final value will be passed from the vertex shader
                              // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
                              // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        // varying vec3 N, vertex_worldspace;
        varying vec4 color;
                                             // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace )
          {                                        // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++)
              {
                            // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                            // light will appear directional (uniform direction from all points), and we 
                            // simply obtain a vector towards the light by directly using the stored value.
                            // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                            // the point light's location from the current surface point.  In either case, 
                            // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                                                  // Compute the diffuse and specular components from the Phong
                                                  // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;

                result += attenuation * light_contribution;
              }
            return result;
          } `
    );
  }
  vertex_glsl_code() {
    // ********* VERTEX SHADER *********
    // TODO (#6b2.2):  Copy the Phong_Shader class's implementation of this function,
    // but declare N and vertex_worldspace as vec3s local to function main,
    // since they are no longer scoped as varyings.  Then, copy over the
    // fragment shader code to the end of main() here.  Computing the Phong
    // color here instead of in the fragment shader is called Gouraud
    // Shading.
    // Modify any lines that assign to gl_FragColor, to assign them to "color",
    // the varying you made, instead.  You cannot assign to gl_FragColor from
    // within the vertex shader (because it is a special variable for final
    // fragment shader color), but you can assign to varyings that will be
    // sent as outputs to the fragment shader.

    // ********* VERTEX SHADER *********
    return (
      this.shared_glsl_code() +
      `
        attribute vec3 position, normal;                            // Position is expressed in object coordinates.
        
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;

        vec3 N, vertex_worldspace;

        void main()
          {                                                                   // The vertex's final resting place (in NDCS):
            gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                                                                              // The final normal vector in screen space.
            N = normalize( mat3( model_transform ) * normal / squared_scale);
            
            vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;

            color = vec4( shape_color.xyz * ambient, shape_color.w );
                                                                     // Compute the final color with contributions from lights:
            color.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
          } `
    );
  }
  fragment_glsl_code() {
    // ********* FRAGMENT SHADER *********
    // A fragment is a pixel that's overlapped by the current triangle.
    // Fragments affect the final image or get discarded due to depth.

    // TODO (#6b2.3):  Leave the main function almost blank, except assign gl_FragColor to
    // just equal "color", the varying you made earlier.
    return (
      this.shared_glsl_code() +
      `
        void main()
          {
            gl_FragColor = color;
          } `
    );
  }
});

const Black_Hole_Shader = (defs.Black_Hole_Shader = class Black_Hole_Shader extends Shader {
  // Simple "procedural" texture shader, with texture coordinates but without an input image.
  update_GPU(context, gpu_addresses, program_state, model_transform, material) {
    // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
    // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
    // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
    // program (which we call the "Program_State").  Send both a material and a program state to the shaders
    // within this function, one data field at a time, to fully initialize the shader for a draw.
    // TODO (#EC 1b):  Send the GPU the only matrix it will need for this shader:  The product of the projection,
    // camera, and model matrices.  The former two are found in program_state; the latter is directly
    // available here.  Finally, pass in the animation_time from program_state. You don't need to allow
    // custom materials for this part so you don't need any values from the material object.
    // For an example of how to send variables to the GPU, check out the simple shader "Funny_Shader".
    const [P, C, M] = [
        program_state.projection_transform,
        program_state.camera_inverse,
        model_transform
      ],
      PCM = P.times(C).times(M);
    context.uniformMatrix4fv(
      gpu_addresses.projection_camera_model_transform,
      false,
      Mat.flatten_2D_to_1D(PCM.transposed())
    );

    context.uniform1f(
      gpu_addresses.animation_time,
      program_state.animation_time / 1000
    );
  }
  shared_glsl_code() {
    // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    // TODO (#EC 1c):  For both shaders, declare a varying vec2 to pass a texture coordinate between
    // your shaders.  Also make sure both shaders have an animation_time input (a uniform).
    return `
      precision mediump float;
      varying vec2 f_tex_coord;
      uniform float animation_time;       
    `;
  }
  vertex_glsl_code() {
    // ********* VERTEX SHADER *********
    // TODO (#EC 1d,e):  Create the final "gl_Position" value of each vertex based on a displacement
    // function.  Also pass your texture coordinate to the next shader.  As inputs,
    // you have the current vertex's stored position and texture coord, animation time,
    // and the final product of the projection, camera, and model matrices.
    return (
      this.shared_glsl_code() +
      `
        attribute vec3 position;
        attribute vec2 texture_coord;
        uniform mat4 projection_camera_model_transform;

        void main()
        { 
          float rate = 20.0 * (2.0 * texture_coord.y + animation_time);
          float displacement = 1.0 + 0.1 * sin(mod(rate, radians(360.)));
          vec3 displaced_position = vec3(position.x * displacement, position.y * displacement, position.z * displacement);
          gl_Position = projection_camera_model_transform * vec4(displaced_position, 1.0);
          
          f_tex_coord = texture_coord;

        }
      `
    );
  }
  fragment_glsl_code() {
    // ********* FRAGMENT SHADER *********
    // TODO (#EC 1f):  Using the input UV texture coordinates and animation time,
    // calculate a color that makes moving waves as V increases.  Store
    // the result in gl_FragColor.
    return (
      this.shared_glsl_code() +
      `
        void main()
        { 
          float a = animation_time;
          float rate = 20.0 * (2.0 * f_tex_coord.y + a);
          float displacement = 0.6 + 1.0 * sin(mod(rate, radians(360.)));
          float u = f_tex_coord.x;
          float v = f_tex_coord.y;
          
          gl_FragColor = vec4(
            max(0.0, displacement * v),
            max(0.0, 0.4 * displacement * v),
            0.0,
            1.0
          );
        }`
    );
  }
});

const Sun_Shader = (defs.Sun_Shader = class Sun_Shader extends Shader {
  update_GPU(
    context,
    gpu_addresses,
    graphics_state,
    model_transform,
    material
  ) {
    // TODO (#EC 2): Pass the same information to the shader as for EC part 1.  Additionally
    // pass material.color to the shader.
    const [P, C, M] = [
        graphics_state.projection_transform,
        graphics_state.camera_inverse,
        model_transform
      ],
      PCM = P.times(C).times(M);
    context.uniformMatrix4fv(
      gpu_addresses.projection_camera_model_transform,
      false,
      Mat.flatten_2D_to_1D(PCM.transposed())
    );
    context.uniform1f(
      gpu_addresses.animation_time,
      graphics_state.animation_time / 1000
    );
    context.uniform4fv(gpu_addresses.sun_color, material.color);
  }
  // TODO (#EC 2):  Complete the shaders, displacing the input sphere's vertices as
  // a fireball effect and coloring fragments according to displacement.

  shared_glsl_code() {
    // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    return `
      precision mediump float;     
      varying float disp;
    `;
  }
  vertex_glsl_code() {
    // ********* VERTEX SHADER *********
    return (
      this.shared_glsl_code() +
      `
        attribute vec3 position, normal;
        attribute vec2 texture_coord;
        
        uniform mat4 projection_camera_model_transform;
        uniform float animation_time;

        vec3 mod289(vec3 x) {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        
        vec4 mod289(vec4 x) {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        
        vec4 permute(vec4 x) {
          return mod289(((x*34.0)+1.0)*x);
        }
        
        vec4 taylorInvSqrt(vec4 r) {
          return 1.79284291400159 - 0.85373472095314 * r;
        }
        
        vec3 fade(vec3 t) {
          return t*t*t*(t*(t*6.0-15.0)+10.0);
        }
        
        // Klassisk Perlin noise 
        float cnoise(vec3 P) {
          vec3 Pi0 = floor(P); // indexing
          vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
          Pi0 = mod289(Pi0);
          Pi1 = mod289(Pi1);
          vec3 Pf0 = fract(P); // Fractional part for interpolation
          vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
          vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
          vec4 iy = vec4(Pi0.yy, Pi1.yy);
          vec4 iz0 = Pi0.zzzz;
          vec4 iz1 = Pi1.zzzz;
        
          vec4 ixy = permute(permute(ix) + iy);
          vec4 ixy0 = permute(ixy + iz0);
          vec4 ixy1 = permute(ixy + iz1);
        
          vec4 gx0 = ixy0 * (1.0 / 7.0);
          vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
          gx0 = fract(gx0);
          vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
          vec4 sz0 = step(gz0, vec4(0.0));
          gx0 -= sz0 * (step(0.0, gx0) - 0.5);
          gy0 -= sz0 * (step(0.0, gy0) - 0.5);
        
          vec4 gx1 = ixy1 * (1.0 / 7.0);
          vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
          gx1 = fract(gx1);
          vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
          vec4 sz1 = step(gz1, vec4(0.0));
          gx1 -= sz1 * (step(0.0, gx1) - 0.5);
          gy1 -= sz1 * (step(0.0, gy1) - 0.5);
        
          vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
          vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
          vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
          vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
          vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
          vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
          vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
          vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
        
          vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
          g000 *= norm0.x;
          g010 *= norm0.y;
          g100 *= norm0.z;
          g110 *= norm0.w;
          vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
          g001 *= norm1.x;
          g011 *= norm1.y;
          g101 *= norm1.z;
          g111 *= norm1.w;
        
          float n000 = dot(g000, Pf0);
          float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
          float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
          float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
          float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
          float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
          float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
          float n111 = dot(g111, Pf1);
        
          vec3 fade_xyz = fade(Pf0);
          vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
          vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
          float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
          return 2.2 * n_xyz;
        }
        
        // Ashima code 
        float turbulence( vec3 p ) {
            float t = -0.5;
            for (float f = 1.0 ; f <= 10.0 ; f++ ){
                float power = pow( 2.0, f );
                t += abs( cnoise( vec3( power * p ) ) / power );
            }
            return t;
        }

        void main()
        {

          float turbulenceDetail = 0.63;
          float time = animation_time;
          float pulseHeight = 0.0;
          float displacementHeight = 0.65;

          float noise = -0.8 * turbulence( turbulenceDetail * normal + ( time * 1.0 ) );
    
          float b = pulseHeight * cnoise(0.05 * position + vec3( 1.0 * time ));
          float displacement = ( pulseHeight - displacementHeight ) * noise + b;

          disp = 20.0 * displacement;

          vec3 newPosition = position + normal * displacement;
          gl_Position = projection_camera_model_transform * vec4( newPosition, 1.0 );
        }
      `
    );
  }
  fragment_glsl_code() {
    // ********* FRAGMENT SHADER *********
    return (
      this.shared_glsl_code() +
      `
        uniform vec4 sun_color;

        void main() 
        {
          vec3 color = vec3((1.0 - disp), (0.1 - disp * 0.2) + 0.1, (0.1 - disp * 0.1) + 0.1 * abs(sin(disp)));
          gl_FragColor = vec4(color.rgb, 1.0);
          gl_FragColor *= sun_color;
        }
      `
    );
  }
});
