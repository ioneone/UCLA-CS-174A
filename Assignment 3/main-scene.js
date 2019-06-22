import {tiny, defs} from './assignment-3-resources.js';
                                                                // Pull these names into this module's scope for convenience:
const { Vec, Mat, Mat4, Color, Shape, Shader,
         Scene, Canvas_Widget, Code_Widget, Text_Widget } = tiny;
const { Cube, Subdivision_Sphere, Transforms_Sandbox_Base } = defs;


    // Now we have loaded everything in the files tiny-graphics.js, tiny-graphics-widgets.js, and assignment-3-resources.js.
    // This yielded "tiny", an object wrapping the stuff in the first two files, and "defs" for wrapping all the rest.

// (Can define Main_Scene's class here)

const Main_Scene = defs.Transforms_Sandbox =
class Transforms_Sandbox extends Transforms_Sandbox_Base
{
      constructor() {
            super();
            this.numFlies = 10;
            this.positions = [];
            this.velocities = [];
            for (let i = 0; i < this.numFlies; i++) {
                  this.positions.push([0, 0, 0]);
                  this.velocities.push([ Math.random() - 0.5, Math.random() - 0.5, 0 ]);
            }

            this.flock = new Flock();

            for (let i = 0; i < 30; i++) {
                  let d = new Dragonfly(0, 0, 0);
                  this.flock.addDragonfly(d);
            }
                 
      }
                                                          // **Transforms_Sandbox** is a Scene object that can be added to any display canvas.
                                                     // This particular scene is broken up into two pieces for easier understanding.
                                                     // See the other piece, Transforms_Sandbox_Base, if you need to see the setup code.
                                                     // The piece here exposes only the display() method, which actually places and draws 
                                                     // the shapes.  We isolate that code so it can be experimented with on its own.
                                                     // This gives you a very small code sandbox for editing a simple scene, and for
                                                     // experimenting with matrix transformations.
  display( context, program_state )
    {                                                // display():  Called once per frame of animation.  For each shape that you want to
                                                     // appear onscreen, place a .draw() call for it inside.  Each time, pass in a
                                                     // different matrix value to control where the shape appears.

                                                     // Variables that are in scope for you to use:
                                                     // this.shapes.box:   A vertex array object defining a 2x2x2 cube.
                                                     // this.shapes.ball:  A vertex array object defining a 2x2x2 spherical surface.
                                                     // this.materials.metal:    Selects a shader and draws with a shiny surface.
                                                     // this.materials.plastic:  Selects a shader and draws a more matte surface.
                                                     // this.lights:  A pre-made collection of Light objects.
                                                     // this.hover:  A boolean variable that changes when the user presses a button.
                                                     // program_state:  Information the shader needs for drawing.  Pass to draw().
                                                     // context:  Wraps the WebGL rendering context shown onscreen.  Pass to draw().                                                       

                                                // Call the setup code that we left inside the base class:
      super.display( context, program_state );

      /**********************************
      Start coding down here!!!!
      **********************************/         
                                                  // From here on down it's just some example shapes drawn for you -- freely 
                                                  // replace them with your own!  Notice the usage of the Mat4 functions 
                                                  // translation(), scale(), and rotation() to generate matrices, and the 
                                                  // function times(), which generates products of matrices.

      /*
      const blue = Color.of( 0,0,1,1 ), yellow = Color.of( 1,1,0,1 ), orange = Color.of( 1, 165/255, 0, 1), wingColor = Color.of( 0, 0, 1, 0.3);
      */
                                    // Variable model_transform will be a local matrix value that helps us position shapes.
                                    // It starts over as the identity every single frame - coordinate axes at the origin.
      let model_transform = Mat4.identity();
                                                     // Draw a hierarchy of objects that appear connected together.  The first shape
                                                     // will be the "parent" or "root" of the hierarchy.  The matrices of the 
                                                     // "child" shapes will use transformations that are calculated as relative
                                                     // values, based on the parent shape's matrix.  Moving the root node should
                                                     // therefore move the whole hierarchy.  To perform this, we'll need a temporary
                                                     // matrix variable that we incrementally adjust (by multiplying in new matrix
                                                     // terms, in between drawing shapes).  We'll draw the parent shape first and
                                                     // then incrementally adjust the matrix it used to draw child shapes.

                                                     // Position the root shape.  For this example, we'll use a box 
                                                     // shape, and place it at the coordinate origin 0,0,0:
      model_transform = model_transform.times( Mat4.translation([ 0,0,0 ]) );
          
      /*
                                                                                              // Draw the top box:
      this.shapes.box.draw( context, program_state, model_transform, this.materials.plastic.override( yellow ) );
      
                                                     // Tweak our coordinate system downward 2 units for the next shape.
      model_transform = model_transform.times( Mat4.translation([ 0, -2, 0 ]) );
                                                                           // Draw the ball, a child of the hierarchy root.
                                                                           // The ball will have its own children as well.
      this.shapes.ball.draw( context, program_state, model_transform, this.materials.metal.override( blue ) );
                                                                      
                                                                      // Prepare to draw another box object 2 levels deep 
                                                                      // within our hierarchy.
                                                                      // Find how much time has passed in seconds; we can use
                                                                      // time as an input when calculating new transforms:

      */

      const t = this.t = program_state.animation_time/1000;
      const frequency = 6;
      
      
      // back off the objects
      model_transform = model_transform.times( Mat4.translation([ 0, 0, -150 ]) );

      if( !this.hover && !this.swarm ) {
            // rotate along the circle
            model_transform = model_transform.times( Mat4.translation( [ 0, 0, 5 ] ) )
                                             .times( Mat4.rotation( t, [ 0, -1, 0 ] ) )
                                             .times( Mat4.translation( [ 15, 0, 0] ) )
                                             .times( Mat4.translation( [ 0, 0, -5 ] ) )
            
            // move up and down
            model_transform = model_transform.times( Mat4.translation( [ 0, 5 * Math.sin( frequency * t ), 0 ] ) )
      
      }

      if (this.swarm || this.swarm2) {
            this.flock.run(this, context, program_state, model_transform);
      } else {
            this.draw_dragonfly( context, program_state, model_transform, 0 )
      }
      
      

      
      
       

      

                                                      // Spin our current coordinate frame as a function of time.  Only do
      /*                                                // this movement if the button on the page has not been toggled off.
      if( !this.hover )
        model_transform = model_transform.times( Mat4.rotation( t, Vec.of( 0,1,0 ) ) )
      */

                                                      // Perform three transforms in a row.
                                                      // Rotate the coordinate frame counter-clockwise by 1 radian,
                                                      // Scale it longer on its local Y axis,
                                                      // and lastly translate down that scaled Y axis by 1.5 units.
                                                      // That translation is enough for the box and ball volume to miss
                                                      // one another (new box radius = 2, ball radius = 1, coordinate
                                                      // frame axis is currently doubled in size).


      /*                                              
      model_transform   = model_transform.times( Mat4.rotation( 1, Vec.of( 0,0,1 ) ) )
                                         .times( Mat4.scale      ([ 1,   2, 1 ]) )
                                         .times( Mat4.translation([ 0,-1.5, 0 ]) );
                                                                                    // Draw the bottom (child) box:
      this.shapes.box.draw( context, program_state, model_transform, this.materials.plastic.override( yellow ) );

                              // Note that our coordinate system stored in model_transform still has non-uniform scaling
                              // due to our scale() call.  This could have undesired effects for subsequent transforms;
                              // rotations will behave like shears.  To avoid this it may have been better to do the
                              // scale() last and then immediately unscale after the draw.  Or better yet, don't store
                              // the scaled matrix back in model_transform at all -- but instead in just a temporary
                              // expression that we pass into draw(), or store under a different name.

      */
    }

    draw_dragonfly(context, program_state, model_transform, index) {

      const flyPosition = this.positions[index];
      const flyVelocity = this.velocities[index];

      const blue = Color.of( 0,0,1,1 ), yellow = Color.of( 1,1,0,1 ), orange = Color.of( 1, 165/255, 0, 1), wingColor = Color.of( 0, 0, 1, 0.3);

      const t = this.t = program_state.animation_time/1000;

      const frequency = 6;
      const stoneAngle = 0.1 + 0.1 * Math.sin( frequency * t );
      const wingAngle = 0.5 * Math.sin( frequency * t );

      const wingHeight = 0.4;
      const wingWidth = 15;

      const legWidth = 0.4;
      const legHeight = 4;
      const legAngle = 0.1 + 0.1 * Math.sin( frequency * t);

      const delta = 0.1 * program_state.animation_delta_time;
      const xBound = 70.0;
      const yBound = 40.0;
      const zBound1 = 80.0;
      const zBound2 = 10.0;

      
//       model_transform = model_transform.times( Mat4.translation( flyPosition ) )
//                                        .times( Mat4.inverse( Mat4.look_at( Vec.of(0, 0, 0), Vec.of(-flyVelocity[0], -flyVelocity[1], -flyVelocity[2]), Vec.of(0, 1, 0))))
//       this.positions[index][0] = flyPosition[0] + delta * flyVelocity[0];
//       if (this.positions[index][0] > xBound) this.positions[index][0] = -xBound;
//       if (this.positions[index][0] < -xBound) this.positions[index][0] = xBound;
//       this.positions[index][1] = flyPosition[1] + delta * flyVelocity[1];
//       if (this.positions[index][1] > yBound) this.positions[index][1] = -yBound;
//       if (this.positions[index][1] < -yBound) this.positions[index][1] = yBound;
//       this.positions[index][2] = flyPosition[2] + delta * flyVelocity[2];
//       if (this.positions[index][2] > zBound1) this.positions[index][2] = -zBound2;
//       if (this.positions[index][2] < -zBound2) this.positions[index][2] = zBound1;

      // head
      this.shapes.box.draw( context, program_state, model_transform, this.materials.plastic.override( yellow ) );

      // right eyeball
      let rightEyeTransform = model_transform;
      rightEyeTransform = rightEyeTransform.times( Mat4.translation( [ -3, 0, 0 ] ) )
                                           .times( Mat4.scale      ( [ 2,  2, 2 ] ) )
                                          
      this.shapes.ball.draw( context, program_state, rightEyeTransform, this.materials.metal.override( blue ) );

      // left eyeball
      let leftEyeTransform = model_transform;
      leftEyeTransform = leftEyeTransform.times( Mat4.translation( [ 3, 0, 0 ] ) )
                                         .times( Mat4.scale      ( [ 2, 2, 2 ] ) )
      this.shapes.ball.draw( context, program_state, leftEyeTransform, this.materials.metal.override( blue ) );

      // first stone                             
      model_transform = model_transform.times( Mat4.translation( [ 0, 0, -2 ] ) );
      this.shapes.box.draw( context, program_state, model_transform, this.materials.plastic.override( orange ) );

      // rest of 9 stones
      for (let i = 2; i <= 10; i++) {
            model_transform = model_transform.times( Mat4.translation( [ 0, 0, -1 ] ) )
                                             .times( Mat4.rotation   ( stoneAngle, [ -1, 0, 0 ] ) )
                                             .times( Mat4.translation( [ 0, 0, -1 ]));

            // draw stone
            this.shapes.box.draw( context, program_state, model_transform, this.materials.plastic.override( orange ) );


            // draw wings
            if (i == 2 || i == 3) {
                  
                  let leftWingTransform = model_transform;
                  let rightWingTransform = model_transform;

                  leftWingTransform = leftWingTransform.times( Mat4.translation( [ 1,             1,              0 ] ) )
                                                       .times( Mat4.rotation   ( wingAngle, [ 0, 0, -1 ] ) )
                                                       .times( Mat4.translation( [ wingWidth / 2, wingHeight / 2, 0 ] ) )
                                                       .times( Mat4.scale      ( [ wingWidth / 2, wingHeight / 2, 1 ] ) );
                  this.shapes.box.draw( context, program_state, leftWingTransform, this.materials.plastic.override ( wingColor ) );


                  rightWingTransform = rightWingTransform.times( Mat4.translation( [ -1,             1,              0 ] ) )
                                                         .times( Mat4.rotation   ( wingAngle, [ 0, 0, 1 ] ) )
                                                         .times( Mat4.translation( [ -wingWidth / 2, wingHeight / 2, 0 ] ) )
                                                         .times( Mat4.scale      ( [ wingWidth / 2,  wingHeight / 2, 1 ] ) );
                  this.shapes.box.draw( context, program_state, rightWingTransform, this.materials.plastic.override ( wingColor ) );

            }

            // draw legs
            if (i == 2 || i == 3 || i == 4) {

                  let leftLegTransform = model_transform;
                  let rightLegTransform = model_transform;

                  /* draw left legs */
                  leftLegTransform = leftLegTransform.times( Mat4.translation( [ 1,            -1,             0 ] ) )
                                                     .times( Mat4.rotation   ( legAngle, [ 0, 0, 1 ] ) )
                                                     .times( Mat4.translation( [ legWidth / 2, -legHeight / 2, 0 ] ) );
                                                     

                  // first segment
                  this.shapes.box.draw( context, program_state, leftLegTransform.times( Mat4.scale( [ legWidth / 2, legHeight / 2, legWidth / 2 ] ) ), this.materials.plastic.override ( yellow ) );

                  leftLegTransform = leftLegTransform.times( Mat4.translation( [ -legWidth / 2, -legHeight / 2, 0 ] ) )
                                                     .times( Mat4.rotation   ( legAngle, [ 0, 0, -1 ] ) )
                                                     .times( Mat4.translation( [ legWidth / 2,  -legHeight / 2, 0 ] ) )
                  
                  // second segment
                  this.shapes.box.draw( context, program_state, leftLegTransform.times( Mat4.scale( [ legWidth / 2, legHeight / 2, legWidth / 2 ] ) ), this.materials.plastic.override ( yellow ) );

                  
                                                     
                  /* draw right legs */
                  rightLegTransform = rightLegTransform.times( Mat4.translation( [ -1,            -1,             0 ] ) )
                                                       .times( Mat4.rotation   ( legAngle, [ 0, 0, -1 ] ) )
                                                       .times( Mat4.translation( [ -legWidth / 2, -legHeight / 2, 0 ] ) );


                  // first segment
                  this.shapes.box.draw( context, program_state, rightLegTransform.times( Mat4.scale( [ legWidth / 2, legHeight / 2, legWidth / 2 ] ) ), this.materials.plastic.override ( yellow ) );

                  rightLegTransform = rightLegTransform.times( Mat4.translation( [ legWidth / 2,  -legHeight / 2, 0 ] ) )
                                                       .times( Mat4.rotation   ( legAngle, [ 0, 0, 1 ] ) )
                                                       .times( Mat4.translation( [ -legWidth / 2, -legHeight / 2, 0 ] ) )
                  
                  // second segment
                  this.shapes.box.draw( context, program_state, rightLegTransform.times( Mat4.scale( [ legWidth / 2, legHeight / 2, legWidth / 2 ] ) ), this.materials.plastic.override ( yellow ) );

                  

            }


      }

      
    }
}

function Flock() {
      this.dragonflies = [];
}

Flock.prototype.run = function(sandbox, context, program_state, model_transform) {
      for (let i = 0; i < this.dragonflies.length; i++) {
            this.dragonflies[i].run(this.dragonflies, sandbox, context, program_state, model_transform);
      }
}

Flock.prototype.addDragonfly = function(d) {
      this.dragonflies.push(d);
}

function Dragonfly(x, y, z) {
      this.acceleration = Vec.of(0, 0, 0);
      let random1 = 2 * Math.random() - 1;
      let random2 = 2 * Math.random() - 1;
      let random3 = 2 * Math.random() - 1;
      this.velocity = Vec.of(random1, random2, random3);
      this.position = Vec.of(x, y, z);
      this.maxspeed = 3;
      this.maxforce = 0.05;
}

Dragonfly.prototype.run = function(dragonflies, sandbox, context, program_state, model_transform) {
      this.flock(dragonflies);
      this.update(program_state);
      this.borders();
      this.render(sandbox, context, program_state, model_transform);

}

Dragonfly.prototype.applyForce = function(force) {
      this.acceleration = this.acceleration.plus(force);
}

Dragonfly.prototype.flock = function(dragonflies) {
      let sep = this.separate(dragonflies);
      let ali = this.align(dragonflies);
      let coh = this.cohesion(dragonflies);

      sep = sep.times(1.0);
      ali = ali.times(0.02);
      coh = coh.times(1.0);

      this.applyForce(sep);
      this.applyForce(ali);
      this.applyForce(coh);
}

Dragonfly.prototype.update = function(program_state) {
      this.velocity = this.velocity.plus(this.acceleration);

      this.velocity = this.velocity.limit(this.maxspeed);
      const t = program_state.animation_delta_time / 50;
      this.position = this.position.plus(this.velocity.times(t));
      this.acceleration = this.acceleration.times(0);


}

Dragonfly.prototype.seek = function(target) {
      let desired = target.minus(this.position);

      desired.normalize();
      desired = desired.times(this.maxspeed);

      let steer = desired.minus(this.velocity);

      steer = steer.limit(this.maxforce);

      return steer;
}

Dragonfly.prototype.render = function(sandbox, context, program_state, model_transform) {
      const flyPosition = this.position;

      const flyVelocity = this.velocity;

      const blue = Color.of( 0,0,1,1 ), yellow = Color.of( 1,1,0,1 ), orange = Color.of( 1, 165/255, 0, 1), wingColor = Color.of( 0, 0, 1, 0.3);

      const t = program_state.animation_time/1000;

      const frequency = 6;
      const stoneAngle = 0.1 + 0.1 * Math.sin( frequency * t );
      const wingAngle = 0.5 * Math.sin( frequency * t );

      const wingHeight = 0.4;
      const wingWidth = 15;

      const legWidth = 0.4;
      const legHeight = 4;
      const legAngle = 0.1 + 0.1 * Math.sin( frequency * t);

      const delta = 0.1 * program_state.animation_delta_time;
      

      
      // face towards moving direction
      model_transform = model_transform.times( Mat4.translation( flyPosition ) )
                                       .times( Mat4.inverse( Mat4.look_at( Vec.of(0, 0, 0), Vec.of(-flyVelocity[0], -flyVelocity[1], -flyVelocity[2]), Vec.of(0, 1, 0))));

      

      // head
      sandbox.shapes.box.draw( context, program_state, model_transform, sandbox.materials.plastic.override( yellow ) );

      // right eyeball
      let rightEyeTransform = model_transform;
      rightEyeTransform = rightEyeTransform.times( Mat4.translation( [ -3, 0, 0 ] ) )
                                           .times( Mat4.scale      ( [ 2,  2, 2 ] ) )
                                          
      sandbox.shapes.ball.draw( context, program_state, rightEyeTransform, sandbox.materials.metal.override( blue ) );

      // left eyeball
      let leftEyeTransform = model_transform;
      leftEyeTransform = leftEyeTransform.times( Mat4.translation( [ 3, 0, 0 ] ) )
                                         .times( Mat4.scale      ( [ 2, 2, 2 ] ) )
      sandbox.shapes.ball.draw( context, program_state, leftEyeTransform, sandbox.materials.metal.override( blue ) );

      // first stone                             
      model_transform = model_transform.times( Mat4.translation( [ 0, 0, -2 ] ) );
      sandbox.shapes.box.draw( context, program_state, model_transform, sandbox.materials.plastic.override( orange ) );

      // rest of 9 stones
      for (let i = 2; i <= 10; i++) {
            model_transform = model_transform.times( Mat4.translation( [ 0, 0, -1 ] ) )
                                             .times( Mat4.rotation   ( stoneAngle, [ -1, 0, 0 ] ) )
                                             .times( Mat4.translation( [ 0, 0, -1 ]));

            // draw stone
            sandbox.shapes.box.draw( context, program_state, model_transform, sandbox.materials.plastic.override( orange ) );


            // draw wings
            if (i == 2 || i == 3) {
                  
                  let leftWingTransform = model_transform;
                  let rightWingTransform = model_transform;

                  leftWingTransform = leftWingTransform.times( Mat4.translation( [ 1,             1,              0 ] ) )
                                                       .times( Mat4.rotation   ( wingAngle, [ 0, 0, -1 ] ) )
                                                       .times( Mat4.translation( [ wingWidth / 2, wingHeight / 2, 0 ] ) )
                                                       .times( Mat4.scale      ( [ wingWidth / 2, wingHeight / 2, 1 ] ) );
                  sandbox.shapes.box.draw( context, program_state, leftWingTransform, sandbox.materials.plastic.override ( wingColor ) );


                  rightWingTransform = rightWingTransform.times( Mat4.translation( [ -1,             1,              0 ] ) )
                                                         .times( Mat4.rotation   ( wingAngle, [ 0, 0, 1 ] ) )
                                                         .times( Mat4.translation( [ -wingWidth / 2, wingHeight / 2, 0 ] ) )
                                                         .times( Mat4.scale      ( [ wingWidth / 2,  wingHeight / 2, 1 ] ) );
                  sandbox.shapes.box.draw( context, program_state, rightWingTransform, sandbox.materials.plastic.override ( wingColor ) );

            }

            // draw legs
            if (i == 2 || i == 3 || i == 4) {

                  let leftLegTransform = model_transform;
                  let rightLegTransform = model_transform;

                  /* draw left legs */
                  leftLegTransform = leftLegTransform.times( Mat4.translation( [ 1,            -1,             0 ] ) )
                                                     .times( Mat4.rotation   ( legAngle, [ 0, 0, 1 ] ) )
                                                     .times( Mat4.translation( [ legWidth / 2, -legHeight / 2, 0 ] ) );
                                                     

                  // first segment
                  sandbox.shapes.box.draw( context, program_state, leftLegTransform.times( Mat4.scale( [ legWidth / 2, legHeight / 2, legWidth / 2 ] ) ), sandbox.materials.plastic.override ( yellow ) );

                  leftLegTransform = leftLegTransform.times( Mat4.translation( [ -legWidth / 2, -legHeight / 2, 0 ] ) )
                                                     .times( Mat4.rotation   ( legAngle, [ 0, 0, -1 ] ) )
                                                     .times( Mat4.translation( [ legWidth / 2,  -legHeight / 2, 0 ] ) )
                  
                  // second segment
                  sandbox.shapes.box.draw( context, program_state, leftLegTransform.times( Mat4.scale( [ legWidth / 2, legHeight / 2, legWidth / 2 ] ) ), sandbox.materials.plastic.override ( yellow ) );

                  
                                                     
                  /* draw right legs */
                  rightLegTransform = rightLegTransform.times( Mat4.translation( [ -1,            -1,             0 ] ) )
                                                       .times( Mat4.rotation   ( legAngle, [ 0, 0, -1 ] ) )
                                                       .times( Mat4.translation( [ -legWidth / 2, -legHeight / 2, 0 ] ) );


                  // first segment
                  sandbox.shapes.box.draw( context, program_state, rightLegTransform.times( Mat4.scale( [ legWidth / 2, legHeight / 2, legWidth / 2 ] ) ), sandbox.materials.plastic.override ( yellow ) );

                  rightLegTransform = rightLegTransform.times( Mat4.translation( [ legWidth / 2,  -legHeight / 2, 0 ] ) )
                                                       .times( Mat4.rotation   ( legAngle, [ 0, 0, 1 ] ) )
                                                       .times( Mat4.translation( [ -legWidth / 2, -legHeight / 2, 0 ] ) )
                  
                  // second segment
                  sandbox.shapes.box.draw( context, program_state, rightLegTransform.times( Mat4.scale( [ legWidth / 2, legHeight / 2, legWidth / 2 ] ) ), sandbox.materials.plastic.override ( yellow ) );

                  

            }


      }

}

Dragonfly.prototype.borders = function() {
      const xBound = 140.0;
      const yBound = 110.0;
      const zBound = 140.0;

      if (this.position[0] > xBound) this.position[0] = -xBound;
      if (this.position[0] < -xBound) this.position[0] = xBound;

      if (this.position[1] > yBound) this.position[1] = -yBound;
      if (this.position[1] < -yBound) this.position[1] = yBound;
      
      if (this.position[2] > zBound) this.position[2] = -zBound;
      if (this.position[2] < -zBound) this.position[2] = zBound;
}

Dragonfly.prototype.separate = function(dragonflies) {
      let desiredseparation = 25.0;
      let steer = Vec.of(0, 0, 0);
      let count = 0;

      for (let i = 0; i < dragonflies.length; i++) {
            let d = this.position.dist(dragonflies[i].position);
            
            if ((d > 0) && d < desiredseparation) {
                  let diff = this.position.minus(dragonflies[i].position);
                  diff.normalize();
                  diff = diff.times(1 / d);
                  steer = steer.plus(diff);
                  count++;
            }
      }
    
      if (count > 0) {
            steer = steer.times(1 / count);
      }

      if (!steer.equals(Vec.of(0, 0, 0))) {
            steer.normalize();
            steer = steer.times(this.maxspeed);
            steer = steer.minus(this.velocity);
            steer = steer.limit(this.maxforce);
      }



      return steer;
}

Dragonfly.prototype.align = function(dragonflies) {
      let neighbordist = 50;
      let sum = Vec.of(0, 0, 0);
      let count = 0;

      for (let i = 0; i < dragonflies.length; i++) {
            let d = this.position.dist(dragonflies[i].position);
            if ((d > 0) && (d < neighbordist)) {
                  sum = sum.plus(dragonflies[i].velocity);
                  count++;
            } 
      }

      if (count > 0) {
            sum = sum.times(1 / count);
            sum.normalize();
            sum = sum.times(this.maxspeed);
            let steer = sum.minus(this.velocity);
            steer.limit(this.maxforce);
            return steer;
      } else {
            return Vec.of(0, 0, 0);
      }
}

Dragonfly.prototype.cohesion = function(dragonflies) {
      let neighbordist = 50;
      let sum = Vec.of(0, 0, 0);
      let count = 0;

      for (let i = 0; i < dragonflies.length; i++) {
            let d = this.position.dist(dragonflies[i].position);
            if ((d > 0) && (d < neighbordist)) {
                  sum = sum.plus(dragonflies[i].position);
                  count++;
            }
      }

      if (count > 0) {
            sum = sum.times(1 / count);
            return this.seek(sum);
      } else {
            return Vec.of(0, 0, 0);
      }
}

const Additional_Scenes = [];

export { Main_Scene, Additional_Scenes, Canvas_Widget, Code_Widget, Text_Widget, defs }