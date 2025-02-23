// Jaren Kawai
// jkawai@ucsc.edu

class Camera{
    constructor(){
        this.eye = new Vector3([13,0,26]);
        this.at = new Vector3([0,0,-100]);
        this.up = new Vector3([0,1,0]);   
    }

    forward(){
        let d = new Vector3();
        var atTemp = new Vector3(this.at.elements);
        var eyeTemp = new Vector3(this.eye.elements);
        d = atTemp.sub(eyeTemp);
        d = d.normalize();
        this.eye = this.eye.add(d);
        this.at = this.at.add(d);
    }

    backward(){
        let d = new Vector3();
        var atTemp = new Vector3(this.at.elements);
        var eyeTemp = new Vector3(this.eye.elements);
        d = atTemp.sub(eyeTemp);
        d = d.normalize();
        this.eye = this.eye.sub(d);
        this.at = this.at.sub(d);
    }

    left(){
        let d = new Vector3();
        let d2 = new Vector3();
        var atTemp = new Vector3(this.at.elements);
        var eyeTemp = new Vector3(this.eye.elements);
        d = atTemp.sub(eyeTemp);
        d2 = Vector3.cross(d, this.up);
        d2.normalize();
        this.eye = this.eye.sub(d2);
        this.at = this.at.sub(d2);
    }

    right(){
        let d = new Vector3();
        let d2 = new Vector3();
        var atTemp = new Vector3(this.at.elements);
        var eyeTemp = new Vector3(this.eye.elements);
        d = atTemp.sub(eyeTemp);
        d2 = Vector3.cross(d, this.up);
        d2.normalize();
        this.eye = this.eye.add(d2);
        this.at = this.at.add(d2);     
    }

    turnLeft(angle = 5){
        var atTemp = new Vector3(this.at.elements);
        var eyeTemp = new Vector3(this.eye.elements);       
        var f = atTemp.sub(eyeTemp);
        var rotationMatrix = new Matrix4()
        rotationMatrix.setRotate(angle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var f_prime = rotationMatrix.multiplyVector3(f);
        this.at = f_prime.add(this.eye);
    }

    turnRight(angle = 5){
        var atTemp = new Vector3(this.at.elements);
        var eyeTemp = new Vector3(this.eye.elements);
        var f = atTemp.sub(eyeTemp);
        var rotationMatrix = new Matrix4()
        rotationMatrix.setRotate(-angle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);  
        var f_prime = rotationMatrix.multiplyVector3(f);
        this.at = f_prime.add(this.eye);
    }

    lookUp(angle) {
        let atTemp = new Vector3(this.at.elements);
        let eyeTemp = new Vector3(this.eye.elements);
        let forward = atTemp.sub(eyeTemp);  // Forward direction
        let right = Vector3.cross(forward, this.up);
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(angle, right.elements[0], right.elements[1], right.elements[2]);

        var f_prime = rotationMatrix.multiplyVector3(forward);
        this.at = f_prime.add(this.eye);
    }

    lookDown(angle) {
        let atTemp = new Vector3(this.at.elements);
        let eyeTemp = new Vector3(this.eye.elements);
        let forward = atTemp.sub(eyeTemp);  // Forward direction
        let right = Vector3.cross(forward, this.up);
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-angle, right.elements[0], right.elements[1], right.elements[2]);
        var f_prime = rotationMatrix.multiplyVector3(forward);
        this.at = f_prime.add(this.eye);
    }

    getGridPositionInFront(distance = 1) {
        // Calculate the forward direction
        let atTemp = new Vector3(this.at.elements);
        let eyeTemp = new Vector3(this.eye.elements);
        let forward = atTemp.sub(this.eye).normalize();

        // Get the point in front of the camera
        let pointInFront = eyeTemp.add(forward);

        // Map the 3D position to grid coordinates
        let mapX = Math.round(pointInFront.elements[0] + 4); // Adjust for grid offset
        let mapZ = Math.round(pointInFront.elements[2] + 4); // Adjust for grid offset

        return { x: mapX, z: mapZ };
    }
}