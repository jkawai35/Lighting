// Jaren Kawai
// jkawai@ucsc.edu

class Circle{
    constructor(){
        this.type='circle'
        this.position = [0.0,0.0,0.0];
        this.color = [1.0,1.0,1.0,1.0];
        this.size = 5.0;
        this.segments = 50;
        this.matrix = new Matrix4();
    }

    render(){

        var xy = this.position;
        var rgba = this.color;
    
        // Set color
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
        // Define top and bottom Z positions
        let topZ = xy[2];               // Top circle Z
        let bottomZ = xy[2] - .5;   // Bottom circle Z
    
        let angleStep = 360 / this.segments; // Angle increment for each segment
    
        for (var angle = 0; angle < 360; angle += angleStep) {
            // Convert degrees to radians
            let angle1 = angle * Math.PI / 180;
            let angle2 = (angle + angleStep) * Math.PI / 180;
    
            // Compute points on the top circle
            let topX1 = xy[0] + Math.cos(angle1) * this.size;
            let topY1 = xy[1] + Math.sin(angle1) * this.size;
            let topX2 = xy[0] + Math.cos(angle2) * this.size;
            let topY2 = xy[1] + Math.sin(angle2) * this.size;
    
            // Compute points on the bottom circle
            let bottomX1 = xy[0] + Math.cos(angle1) * this.size;
            let bottomY1 = xy[1] + Math.sin(angle1) * this.size;
            let bottomX2 = xy[0] + Math.cos(angle2) * this.size;
            let bottomY2 = xy[1] + Math.sin(angle2) * this.size;
    
            // First triangle (top-left to bottom-left to bottom-right)
            drawTriangle3D(
                [topX1, topY1, topZ,    // Top-left
                bottomX1, bottomY1, bottomZ,  // Bottom-left
                bottomX2, bottomY2, bottomZ]   // Bottom-right
            );
    
            // Second triangle (top-left to bottom-right to top-right)
            drawTriangle3D(
                [topX1, topY1, topZ,    // Top-left
                bottomX2, bottomY2, bottomZ,  // Bottom-right
                topX2, topY2, topZ]    // Top-right
            );
        }
        /*
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);


        //Draw
        var d = this.size/200.0; //delta

        let angleStep=360/this.segments;

        for(var angle = 0; angle < 360; angle = angle + angleStep){
            let centerPt = [xy[0], xy[1]];
            let angle1 = angle;
            let angle2 = angle+angleStep;
            let vec1 = [Math.cos(angle1*Math.PI/180), Math.sin(angle1*Math.PI/180)];
            let vec2 = [Math.cos(angle2*Math.PI/180), Math.sin(angle2*Math.PI/180)];
            let pt1 = [centerPt[0]+vec1[0], centerPt[1]+vec1[1]];
            let pt2 = [centerPt[0]+vec2[0], centerPt[1]+vec2[1]];

            drawTriangle3D( [xy[0], xy[1], 1, pt1[0], pt1[1], 0, pt2[0], pt2[1], 0] );

        }*/
    }
}