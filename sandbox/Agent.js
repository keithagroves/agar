/**
 * Autonomous agar.io agent.
 */

var STEP_TIMEOUT = 50;

/**
 * Agent
 *
 * @param {Controller} controller agar.io controller for the player.
 * @return {Agent}
 */
function Agent(controller) {
  this.controller = controller;
}
module.exports = Agent;

Agent.prototype.run = function run() {
  this.step();
  this.nextStep = setTimeout(this.run.bind(this), STEP_TIMEOUT);
};

Agent.prototype.stop = function stop() {
  if (this.nextStep) {
    clearTimeout(this.nextStep);
  }
};

Agent.prototype.step = function step() {
  //this.controller.sendPosition(0, -200);
  //this.controller.sendPosition(2000, 2000);
  //this.controller.sendPosition(-200, 0);
};
