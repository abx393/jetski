function bank(camera, sprite, angle) {
  if (camera.rotation.z !== angle) {
    sprite.rotation.z = weightedAverage(camera.rotation.z, angle, 100, 1);
    camera.rotation.z = weightedAverage(camera.rotation.z, angle, 100, 1);

    sprite.rotation.y = weightedAverage(camera.rotation.y, angle, 100, 1);
    camera.rotation.y = weightedAverage(camera.rotation.y, angle, 100, 1);
  }
}

function updateVelocity(goal, curr) {
  return weightedAverage(goal, curr, 1, 100);
}

function weightedAverage(a, b, wa, wb) {
  return (wa * a + wb * b) / (wa + wb);
}
