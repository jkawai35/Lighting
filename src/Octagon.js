// Jaren Kawai
// jkawai@ucsc.edu

class Octagon {
    constructor() {
        this.type = 'octagon';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Octagon parameters
        let radius = 1.0;
        let height = 1.0;
        let angleStep = Math.PI / 4;

        let topVertices = [];
        let bottomVertices = [];

        // Generate octagon points
        for (let i = 0; i < 8; i++) {
            let angle = i * angleStep;
            let x = Math.cos(angle) * radius;
            let z = Math.sin(angle) * radius;

            topVertices.push([x, height / 2, z]);   // Top face vertices
            bottomVertices.push([x, -height / 2, z]); // Bottom face vertices
        }

        // Draw top face (fan)
        for (let i = 0; i < 8; i++) {
            let next = (i + 1) % 8;
            drawTriangle3D([
                0, height / 2, 0, // Center
                topVertices[i][0], topVertices[i][1], topVertices[i][2],
                topVertices[next][0], topVertices[next][1], topVertices[next][2]
            ]);
        }

        // Draw bottom face (fan)
        for (let i = 0; i < 8; i++) {
            let next = (i + 1) % 8;
            drawTriangle3D([
                0, -height / 2, 0, // Center
                bottomVertices[next][0], bottomVertices[next][1], bottomVertices[next][2],
                bottomVertices[i][0], bottomVertices[i][1], bottomVertices[i][2]
            ]);
        }

        // Draw side faces (connect top & bottom)
        for (let i = 0; i < 8; i++) {
            let next = (i + 1) % 8;

            gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);

            drawTriangle3D([
                topVertices[i][0], topVertices[i][1], topVertices[i][2],
                bottomVertices[i][0], bottomVertices[i][1], bottomVertices[i][2],
                bottomVertices[next][0], bottomVertices[next][1], bottomVertices[next][2]
            ]);

            drawTriangle3D([
                topVertices[i][0], topVertices[i][1], topVertices[i][2],
                bottomVertices[next][0], bottomVertices[next][1], bottomVertices[next][2],
                topVertices[next][0], topVertices[next][1], topVertices[next][2]
            ]);
        }
    }
}
