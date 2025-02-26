// Jaren Kawai
// jkawai@ucsc.edu


class Sphere{
    constructor(){
        this.type='sphere'
        //this.position = [0.0,0.0,0.0];
        this.color = [1.0,1.0,1.0,1.0];
        //this.size = 5.0;
        //this.segments = 10;
        this.matrix = new Matrix4();
        this.textureNum = -2;
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

        var d = Math.PI/25;
        var dd = Math.PI/25;

        for (var t = 0; t < Math.PI; t += d){
            for (var r = 0; r < (2*Math.PI); r += d){
                var p1 = [Math.sin(t)*Math.cos(r), Math.sin(t)*Math.sin(r), Math.cos(t)];
                
                var p2 = [Math.sin(t+dd)*Math.cos(r), Math.sin(t+dd)*Math.sin(r), Math.cos(t+dd)];
                var p3 = [Math.sin(t)*Math.cos(r+dd), Math.sin(t)*Math.sin(r+dd), Math.cos(t)];
                var p4 = [Math.sin(t+dd)*Math.cos(r+dd), Math.sin(t+dd)*Math.sin(r+dd), Math.cos(t+dd)];

                var uv1 = [t/Math.PI, r/(2*Math.PI)];
                var uv2 = [(t+dd)/Math.PI, r/(2*Math.PI)];
                var uv3 = [t/Math.PI, (r+dd)/(2*Math.PI)];
                var uv4 = [(t+dd)/Math.PI, (r+dd)/(2*Math.PI)];

                var v = [];
                var uv = [];
                v = v.concat(p1); uv = uv.concat(uv1);
                v = v.concat(p2); uv = uv.concat(uv2);
                v = v.concat(p4); uv = uv.concat(uv4);

                //gl.uniform4f(u_FragColor, 1,1,0,1);
                drawTriangle3DUVNormal(v,uv,v);

                v = []; uv = [];
                v = v.concat(p1); uv = uv.concat(uv1);
                v = v.concat(p4); uv = uv.concat(uv4);
                v = v.concat(p3); uv = uv.concat(uv3);
                //gl.uniform4f(u_FragColor, 1,1,0,1);
                drawTriangle3DUVNormal(v,uv,v);

            }
        }


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


    renderNormal(){
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;

        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        drawTriangle3DUVNormal( [0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0], [0,0, 1,1, 1,0], [0.0, 0.0, -1.0,  0.0, 0.0, -1.0,  0.0, 0.0, -1.0,]);//front
        drawTriangle3DUVNormal( [0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0], [0,0, 0,1, 1,1], [0.0, 0.0, -1.0,  0.0, 0.0, -1.0,  0.0, 0.0, -1.0,]);

        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        drawTriangle3DUVNormal( [0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0], [0,0, 0,1, 1,1], [0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 0.0, -1.0,]);//top
        drawTriangle3DUVNormal( [0.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0], [0,0, 1,1, 1,0], [0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 0.0, -1.0,]);

        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

        drawTriangle3DUVNormal( [1.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 1.0], [0,0, 0,1, 1,1], [1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,]);//right
        drawTriangle3DUVNormal( [1.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 1.0, 1.0], [0,0, 1,0, 1,1], [1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,]);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        drawTriangle3DUVNormal( [0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0], [1,0, 1,1, 0,1], [0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,]);//back
        drawTriangle3DUVNormal( [0.0, 0.0, 1.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0], [1,0, 0,1, 0,0], [0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,]);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        drawTriangle3DUVNormal( [0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  0.0, 1.0, 0.0], [1,0, 0,0, 1,1], [-1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,]);//left
        drawTriangle3DUVNormal( [0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  0.0, 0.0, 1.0], [1,1, 0,1, 0,0], [-1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,]);

        gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);

        drawTriangle3DUVNormal( [0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  1.0, 0.0, 0.0], [0,1, 0,0, 1,1], [0.0, -1.0, 0.0,  0.0, -1.0, 0.0,  0.0, -1.0, 0.0,]);//bottom
        drawTriangle3DUVNormal( [0.0, 0.0, 1.0,  1.0, 0.0, 0.0,  1.0, 0.0, 1.0], [0,0, 1,1, 1,0], [0.0, -1.0, 0.0,  0.0, -1.0, 0.0,  0.0, -1.0, 0.0,]);
    }
}
