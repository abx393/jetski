function bank(camera, sprite, mesh, angle) {
  if (mesh.rotation.z !== angle) {
    //sprite.rotation.z = weightedAverage(mesh.rotation.z, angle, 100, 1);
    mesh.rotation.z = weightedAverage(mesh.rotation.z, angle, 100, 1);
    camera.rotation.z = weightedAverage(mesh.rotation.z, angle, 100, 1);

    //console.log("mesh.rotation.y " + mesh.rotation.y);
    //console.log("angle " + angle);
    //sprite.rotation.y = weightedAverage(mesh.rotation.y, angle, 100, 1);

    mesh.rotation.y = weightedAverage(mesh.rotation.y, angle, 100, 1);
    camera.rotation.y = weightedAverage(mesh.rotation.y, angle, 100, 1);
  }
}

function updateVelocity(goal, curr) {
  return weightedAverage(goal, curr, 1, 100);
}

function weightedAverage(a, b, wa, wb) {
  return (wa * a + wb * b) / (wa + wb);
}
