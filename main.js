import { Player } from './player.js';
import { InputHandler } from './input.js';
import { Background } from './background.js';
import { FlyingEnemy, ClimbingEnemy, GroundEnemy } from './enemies.js';
import { UI } from './UI.js';

window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 900;
    canvas.height = 500;

    class Game {
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.groundMargin = 80;
            this.speed = 0;
            this.maxSpeed = 3;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.UI = new UI(this);
            this.enemies = [];
            this.particles = [];
            this.collisions = [];
            this.floatingMessages = [];
            this.maxParticles = 200;
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.debug = false;
            this.score = 0;
            this.winningScore = 35;
            this.fontColor = 'black';
            this.time = 30000;  // Start time at 30 seconds (30000 milliseconds)
            this.maxTime = 30000;  // Total time is 30 seconds
            this.gameOver = false;
            this.lives = 5;
            this.player.currentState = this.player.states[0];
            this.player.currentState.enter();
        }

        update(deltaTime) {
            // Countdown from maxTime
            if (this.time > 0) {
                this.time -= deltaTime;
            } else {
                this.gameOver = true;
            }

            this.background.update();
            this.player.update(this.input.keys, deltaTime);

            // Handle Enemies
            if (this.enemyTimer > this.enemyInterval) {
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }

            this.enemies.forEach(enemy => {
                enemy.update(deltaTime);
            });

            // Handle messages
            this.floatingMessages.forEach(message => {
                message.update();
            });

            // Handle particles
            this.particles.forEach((particle, index) => {
                particle.update();
            });

            if (this.particles.length > this.maxParticles) {
                this.particles.length = this.maxParticles;
            }

            // Handle collision sprites
            this.collisions.forEach((collision, index) => {
                collision.update();
            });

            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            this.particles = this.particles.filter(particle => !particle.markedForDeletion);
            this.collisions = this.collisions.filter(collision => !collision.markedForDeletion);
            this.floatingMessages = this.floatingMessages.filter(message => !message.markedForDeletion);
        }

        draw(context){
            this.background.draw(context);
            this.player.draw(context);

            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });

            this.particles.forEach(particle => {
                particle.draw(context);
            });

            this.collisions.forEach(collision => {
                collision.draw(context);
            });

            this.floatingMessages.forEach(message => {
                message.draw(context);
            });

            this.UI.draw(context);
        }

        addEnemy(){
            if (this.speed > 0 && Math.random() < 0.5) this.enemies.push(new GroundEnemy(this));
            else if (this.speed > 0) this.enemies.push(new ClimbingEnemy(this));

            this.enemies.push(new FlyingEnemy(this));
        }
    }

    class UI {
        constructor(game){
            this.game = game;
            this.fontSize = 30;
            this.fontFamily = 'Helvetica';
            this.livesImage = document.getElementById('lives');
        }

        draw(context){
            context.save();
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'white';
            context.shadowBlur = 0;
            context.font = this.fontSize + 'px ' + this.fontFamily;
            context.textAlign = 'left';
            context.fillStyle = this.game.fontColor;

            // Score
            context.fillText('Score: ' + this.game.score, 20, 50);

            // Timer (show countdown)
            context.font = this.fontSize * 0.8 + 'px ' + this.fontFamily;
            let timeRemaining = (this.game.time * 0.001).toFixed(1);  // Convert milliseconds to seconds
            timeRemaining = Math.max(0, timeRemaining);  // Ensure time doesn't go negative
            context.fillText('Time: ' + timeRemaining, 20, 80);

            // Lives
            for (let i = 0; i < this.game.lives; i++){
                context.drawImage(this.livesImage, 25 * i + 20, 95, 25, 25);
            }

            // Game Over message
            if (this.game.gameOver){
                context.textAlign = 'center';
                context.font = this.fontSize * 2 + 'px ' + this.fontFamily;
                if (this.game.score > this.game.winningScore){
                    context.fillText('You Win!', this.game.width * 0.5, this.game.height * 0.5 - 20);
                    context.font = this.fontSize * 0.7 + 'px ' + this.fontFamily;
                    context.fillText('That is some good rolling!', this.game.width * 0.5, this.game.height * 0.5 + 20);
                } else {
                    context.fillText('Game Over', this.game.width * 0.5, this.game.height * 0.5 - 20);
                    context.font = this.fontSize * 0.7 + 'px ' + this.fontFamily;
                    context.fillText('Better luck next time!', this.game.width * 0.5, this.game.height * 0.5 + 20);
                }
            }
            context.restore();
        }
    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;

    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        if (!game.gameOver) requestAnimationFrame(animate);
    }
    animate(0);
});
