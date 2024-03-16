import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';



export function createTextMesh(message, textSize, textColor, position, scene) {

    const loader = new FontLoader();
    loader.load( '/assets/fonts/helvetiker_regular.typeface.json', function ( font ) {

        const matLite = new THREE.MeshBasicMaterial( {
            color: textColor,
            // transparent: true,
            // opacity: 0.4,
            side: THREE.DoubleSide
        } );

        const shapes = font.generateShapes( message, textSize );

        const geometry = new THREE.ShapeGeometry( shapes );

        geometry.computeBoundingBox();

        const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );

        geometry.translate( xMid, 0, 0 );

        // make shape ( N.B. edge view not visible )
        
        const text = new THREE.Mesh( geometry, matLite );

        text.scale.set(0.06,0.06,0.06)
        text.position.set(position.x, position.y, position.z)
        // console.log(text)
        scene.add( text );

        return text

        //use groups and ids to get the different letters
        // textbook selecting objects example
    } ) //end load function
}