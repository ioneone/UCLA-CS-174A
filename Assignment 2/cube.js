
var canvas;
var gl;

var NumVertices  = 18;
                                   // For each face of the cube, make two triangles of three vertices each:
var vertexPositions = [
    // square
    vec4( -0.5, 0.5, 0.5, 1 ),
    vec4( -0.5, -0.5, 0.5, 1 ),
    vec4( 0.5, -0.5, 0.5, 1 ),
    vec4( -0.5, 0.5, 0.5, 1 ),
    vec4( 0.5, -0.5, 0.5, 1 ),
    vec4( 0.5, 0.5, 0.5, 1 ),

    // top
    vec4( 0.0, 0.0, 0.0, 1 ),
    vec4( -0.5, 0.5, 0.5, 1 ),
    vec4( 0.5, 0.5, 0.5, 1 ),

    // right
    vec4( 0.0, 0.0, 0.0, 1 ),
    vec4( 0.5, -0.5, 0.5, 1 ),
    vec4( 0.5, 0.5, 0.5, 1 ),
    
    // bottom
    vec4( 0.0, 0.0, 0.0, 1 ),
    vec4( -0.5, -0.5, 0.5, 1 ),
    vec4( 0.5, -0.5, 0.5, 1 ),
    

    // left
    vec4( 0.0, 0.0, 0.0, 1 ),
    vec4( -0.5, 0.5, 0.5, 1 ),
    vec4( -0.5, -0.5, 0.5, 1 )
   

];

var vertexColors = [
    // square
    vertexPositions[0],
    vertexPositions[1],
    vertexPositions[2],
    vertexPositions[3],
    vertexPositions[4],
    vertexPositions[5],

    // top
    [ 0.0, 1.0, 0.0, 1.0 ],
    [ 0.0, 1.0, 0.0, 1.0 ],
    [ 0.0, 1.0, 0.0, 1.0 ],
    
    // right
    [ 1.0, 0.0, 0.0, 1.0 ],
    [ 1.0, 0.0, 0.0, 1.0 ],
    [ 1.0, 0.0, 0.0, 1.0 ],

    // bottom
    vertexPositions[12],
    vertexPositions[13],
    vertexPositions[14],

    // left
    vertexPositions[15],
    vertexPositions[16],
    vertexPositions[17]

];


var NumVertices2  = 36;
                                   // For each face of the cube, make two triangles of three vertices each:
var vertexPositions2 = [
    vec4( -0.5, 0.0, 0.0, 1 ),
    vec4( -0.5, -0.5, 0.0, 1 ),
    vec4( 0.0, -0.5, 0.0, 1 ),
    vec4( -0.5, 0.0, 0.0, 1 ),
    vec4( 0.0, -0.5, 0.0, 1 ),
    vec4( 0.0, 0.0, 0.0, 1 ),

    vec4( 0.0, 0.0, 0.0, 1 ),
    vec4( 0.0, -0.5, 0.0, 1 ),
    vec4( 0.0, -0.5, -0.5, 1 ),
    vec4( 0.0, 0.0, 0.0, 1 ),
    vec4( 0.0, -0.5, -0.5, 1 ),    
    vec4( 0.0, 0.0, -0.5, 1 ),

    vec4( 0.0, -0.5, 0.0, 1 ),
    vec4( -0.5, -0.5, 0.0, 1 ),
    vec4( -0.5, -0.5, -0.5, 1 ),
    vec4( 0.0, -0.5, 0.0, 1 ),
    vec4( -0.5, -0.5, -0.5, 1 ),
    vec4( 0.0, -0.5, -0.5, 1 ),

    vec4( 0.0, 0.0, -0.5, 1 ),
    vec4( -0.5, 0.0, -0.5, 1 ),
    vec4( -0.5, 0.0, 0.0, 1 ),
    vec4( 0.0, 0.0, -0.5, 1 ),
    vec4( -0.5, 0.0, 0.0, 1 ),
    vec4( 0.0, 0.0, 0.0, 1 ),

    vec4( -0.5, -0.5, -0.5, 1 ),
    vec4( -0.5, 0.0, -0.5, 1 ),
    vec4( 0.0, 0.0, -0.5, 1 ),
    vec4( -0.5, -0.5, -0.5, 1 ),
    vec4( 0.0, 0.0, -0.5, 1 ),
    vec4( 0.0, -0.5, -0.5, 1 ),
    
    vec4( -0.5, 0.0, -0.5, 1 ),
    vec4( -0.5, -0.5, -0.5, 1 ),
    vec4( -0.5, -0.5, 0.0, 1 ),
    vec4( -0.5, 0.0, -0.5, 1 ),
    vec4( -0.5, -0.5, 0.0, 1 ),
    vec4( -0.5, 0.0, 0.0, 1 )
];

var vertexColors2 = [
    [ 1.0, 0.0, 0.0, 1.0 ], // red
    [ 1.0, 0.0, 0.0, 1.0 ],
    [ 1.0, 0.0, 0.0, 1.0 ],
    [ 1.0, 0.0, 0.0, 1.0 ],
    [ 1.0, 0.0, 0.0, 1.0 ],
    [ 1.0, 0.0, 0.0, 1.0 ],

    [ 1.0, 1.0, 0.0, 1.0 ], // yellow
    [ 1.0, 1.0, 0.0, 1.0 ],
    [ 1.0, 1.0, 0.0, 1.0 ],
    [ 1.0, 1.0, 0.0, 1.0 ],
    [ 1.0, 1.0, 0.0, 1.0 ],
    [ 1.0, 1.0, 0.0, 1.0 ],

    [ 0.0, 1.0, 0.0, 1.0 ], // green
    [ 0.0, 1.0, 0.0, 1.0 ],
    [ 0.0, 1.0, 0.0, 1.0 ],
    [ 0.0, 1.0, 0.0, 1.0 ],
    [ 0.0, 1.0, 0.0, 1.0 ],
    [ 0.0, 1.0, 0.0, 1.0 ],

    [ 0.0, 1.0, 1.0, 1.0 ], // cyan
    [ 0.0, 1.0, 1.0, 1.0 ],
    [ 0.0, 1.0, 1.0, 1.0 ],
    [ 0.0, 1.0, 1.0, 1.0 ],
    [ 0.0, 1.0, 1.0, 1.0 ],
    [ 0.0, 1.0, 1.0, 1.0 ],

    [ 0.0, 0.0, 1.0, 1.0 ], // blue
    [ 0.0, 0.0, 1.0, 1.0 ],
    [ 0.0, 0.0, 1.0, 1.0 ],
    [ 0.0, 0.0, 1.0, 1.0 ],
    [ 0.0, 0.0, 1.0, 1.0 ],
    [ 0.0, 0.0, 1.0, 1.0 ],

    [ 1.0, 0.0, 1.0, 1.0 ], // magenta
    [ 1.0, 0.0, 1.0, 1.0 ],
    [ 1.0, 0.0, 1.0, 1.0 ],
    [ 1.0, 0.0, 1.0, 1.0 ],
    [ 1.0, 0.0, 1.0, 1.0 ],
    [ 1.0, 0.0, 1.0, 1.0 ]
];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var thetaLoc;

var program;

var cBuffer;
var vBuffer;

var cBuffer2;
var vBuffer2;

var vColor;
var vPosition;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW );

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexPositions), gl.STATIC_DRAW );
    

    cBuffer2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer2 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexColors2), gl.STATIC_DRAW );

    vBuffer2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer2 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexPositions2), gl.STATIC_DRAW );

    vColor = gl.getAttribLocation( program, "vColor" );
    vPosition = gl.getAttribLocation( program, "vPosition" );
    thetaLoc = gl.getUniformLocation(program, "theta");

    gl.enableVertexAttribArray( vColor );
    gl.enableVertexAttribArray( vPosition );

    //event listeners for buttons
    
    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };
        
    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);

    // draw pyramid
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
    
    // draw cube
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer2 );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer2 );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );

    gl.drawArrays( gl.TRIANGLES, 0, NumVertices2 );

    requestAnimFrame( render );
}
