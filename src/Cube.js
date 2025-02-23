// Jaren Kawai
// jkawai@ucsc.edu


class Cube{
    constructor(){
        this.type='cube'
        //this.position = [0.0,0.0,0.0];
        this.color = [1.0,1.0,1.0,1.0];
        //this.size = 5.0;
        //this.segments = 10;
        this.matrix = new Matrix4();
        this.textureNum = 0;
        this.verts = [
            0,0,0, 1,1,0, 1,0,0,
            0,0,0, 0,1,0, 1,1,0,
            0,1,0, 0,1,1, 1,1,1,
            0,1,0, 1,1,1, 1,1,0,
    
            1,0,0, 1,1,0, 1,1,1,
            1,0,0, 1,0,1, 1,1,1,
    
            0,0,1, 0,1,1, 1,1,1,
            0,0,1, 1,1,1, 1,0,1,
    
            0,0,0, 0,0,1, 0,1,0,
            0,1,0, 0,1,1, 0,0,1,
    
            0,0,0, 0,0,1, 1,0,0,
            0,0,1, 1,0,0, 1,0,1
        ];
        this.uv_coords = [
            0,0, 1,1, 1,0,  0,0, 0,1, 1,1,
            0,0, 0,1, 1,1,  0,0, 1,1, 1,0,
            0,0, 0,1, 1,1,  0,0, 1,0, 1,1,

            1,0, 1,1, 0,1,  1,0, 0,1, 0,0,

            1,0, 0,0, 1,1,  1,1, 0,1, 0,0,
            0,1, 0,0, 1,1,  0,0, 1,1, 1,0
        ];
    }

    render(){
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;

        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        drawTriangle3DUV( [0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0], [0,0, 1,1, 1,0]);//front
        drawTriangle3DUV( [0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0], [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        drawTriangle3DUV( [0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0], [0,0, 0,1, 1,1]);//top
        drawTriangle3DUV( [0.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0], [0,0, 1,1, 1,0]);

        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

        drawTriangle3DUV( [1.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 1.0], [0,0, 0,1, 1,1]);//right
        drawTriangle3DUV( [1.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 1.0, 1.0], [0,0, 1,0, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        drawTriangle3DUV( [0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0], [1,0, 1,1, 0,1]);//back
        drawTriangle3DUV( [0.0, 0.0, 1.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0], [1,0, 0,1, 0,0]);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        drawTriangle3DUV( [0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  0.0, 1.0, 0.0], [1,0, 0,0, 1,1]);//left
        drawTriangle3DUV( [0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  0.0, 0.0, 1.0], [1,1, 0,1, 0,0]);

        gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);

        drawTriangle3DUV( [0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  1.0, 0.0, 0.0], [0,1, 0,0, 1,1]);//bottom
        drawTriangle3DUV( [0.0, 0.0, 1.0,  1.0, 0.0, 0.0,  1.0, 0.0, 1.0], [0,0, 1,1, 1,0]);


    }

    renderfast(){
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;

        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var allverts = [];
        allverts = allverts.concat( [0,0,0, 1,1,0, 1,0,0] );
        allverts = allverts.concat( [0,0,0, 0,1,0, 1,1,0] );

        allverts = allverts.concat( [0,1,0, 0,1,1, 1,1,1] );
        allverts = allverts.concat( [0,1,0, 1,1,1, 1,1,0] );

        allverts = allverts.concat( [1,0,0, 1,1,0, 1,1,1] );
        allverts = allverts.concat( [1,0,0, 1,0,1, 1,1,1] );

        allverts = allverts.concat( [0,0,1, 0,1,1, 1,1,1] );
        allverts = allverts.concat( [0,0,1, 1,1,1, 1,0,1] );

        allverts = allverts.concat( [0,0,0, 0,0,1, 0,1,0] );
        allverts = allverts.concat( [0,1,0, 0,1,1, 0,0,1] );

        allverts = allverts.concat( [0,0,0, 0,0,1, 1,0,0] );
        allverts = allverts.concat( [0,0,1, 1,0,0, 1,0,1] );

        drawTriangle3DUV(this.verts, this.uv_coords);
        //drawTriangle3DUV( [0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0], [0,0, 1,1, 1,0]);//front
        //drawTriangle3DUV( [0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0], [0,0, 0,1, 1,1]);

        //gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        //drawTriangle3DUV( [0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0], [0,0, 0,1, 1,1]);//top
        //drawTriangle3DUV( [0.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0], [0,0, 1,1, 1,0]);

        //gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

        //drawTriangle3DUV( [1.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 1.0], [0,0, 0,1, 1,1]);//right
        //drawTriangle3DUV( [1.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 1.0, 1.0], [0,0, 1,0, 1,1]);

        //gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        //drawTriangle3DUV( [0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0], [1,0, 1,1, 0,1]);//back
        //drawTriangle3DUV( [0.0, 0.0, 1.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0], [1,0, 0,1, 0,0]);

        //gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        //drawTriangle3DUV( [0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  0.0, 1.0, 0.0], [1,0, 0,0, 1,1]);//left
        //drawTriangle3DUV( [0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  0.0, 0.0, 1.0], [1,1, 0,1, 0,0]);

        //gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);

        //drawTriangle3DUV( [0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  1.0, 0.0, 0.0], [0,1, 0,0, 1,1]);//bottom
        //drawTriangle3DUV( [0.0, 0.0, 1.0,  1.0, 0.0, 0.0,  1.0, 0.0, 1.0], [0,0, 1,1, 1,0]);


    }

    renderfast2(){
        var rgba = this.color;
        //var size = this.size;

        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        drawTriangle3DUV( this.verts, this.uv_coords);
    }
}
