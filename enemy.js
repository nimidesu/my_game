// 敵：作る・入れる・動かす・描く（足すものの形）
const MAX_ENEMIES = 6;   // 敵は、同時にこの数まで
// ① 作る：敵を1体作って返す関数（呼ぶたびに、新しい敵が1体できる）
function createEnemy(x, vx, canNotice = false) {
  return { x: x, y: floor.y - 32, w: 32, h: 32, vx: vx, baseVx:Math.abs(vx), canNotice: canNotice, isAlert:false, alive: true };
}

// ② 入れる：敵をまとめて入れる配列（７-６で入れ直すので let）

let enemies = [];
let spawnTimer = 0;   // 敵を出すタイマー
let nextSpawn = 2;    // 次の敵を出すまでの時間（秒

function resetEnemies() {
enemies = [];
const one = createEnemy(200, 80);
enemies.push(createEnemy(100, 70));
enemies.push(createEnemy(300, 90));
enemies.push(createEnemy(500, 50));
enemies.push(createEnemy(50, 80, true));
spawnTimer = 0;
nextSpawn = 2;
}
// 敵を時間で出す（タイマーの形・くり返す）
function spawnEnemies(dt) {
  spawnTimer = spawnTimer + dt;
  if (spawnTimer >= nextSpawn) {
    if (enemies.length < MAX_ENEMIES) {
      // 左の端か右の端か、くじで決める
      if (Math.random() < 0.5) {
        enemies.push(createEnemy(0, 100));                    // 左の端から、右へ
      } else {
        enemies.push(createEnemy(canvas.width - 32, -100));   // 右の端から、左へ
      }
    }
    spawnTimer = 0;
    nextSpawn = 1 + Math.random() * 2;   // 次は 1〜3 秒のどれか
  }
}
// ③ 動かす：配列の敵を1体ずつ取り出して、同じ処理をする
function updateEnemies(dt) 
{  
  for (const enemy of enemies) {
        if (enemy.canNotice) {
      // プレイヤーとの横の距離を計算
      const dist = Math.abs(player.x - enemy.x);
      const noticeRange = 150; // 気づく距離（150ピクセル以内）

      if (dist < noticeRange) {
        enemy.isAlert = true;
        // 現在の向き（+1 または -1）を保ったまま、元の2.5倍の速さにする
        const dir = enemy.vx >= 0 ? 1 : -1;
        enemy.vx = dir * enemy.baseVx * 2.5;
      } else {
        enemy.isAlert = false;
        // 離れたら元の速さに戻す
        const dir = enemy.vx >= 0 ? 1 : -1;
        enemy.vx = dir * enemy.baseVx;
      }
    }

    enemy.x = enemy.x + enemy.vx * dt;
    // 端を越えたら、位置を戻して、向きを反対に（５-４の跳ね返り）
    if (enemy.x < 0) {
      enemy.x = 0;
      enemy.vx = -enemy.vx;
    }
    if (enemy.x + enemy.w > canvas.width) {
      enemy.x = canvas.width - enemy.w;
      enemy.vx = -enemy.vx;
    }
  }
}
// プレイヤーとぶつかったとき：上から落ちてきたときだけ、敵を倒す
function collideWithEnemies(prevBottom) {
  for (const enemy of enemies) {
    if (aabb(player, enemy) && prevBottom <= enemy.y && player.vy > 0) {
      enemy.alive = false;            // 倒した（状態を書き換える）
      player.vy = -JUMP_SPEED / 2;    // 踏んだら、少し跳ねる
       score = score + 1;              // 点数を足す（★ main.js の score を書き換える）
    } else if (aabb(player, enemy) && player.hitTimer <= 0) {
      player.hp = player.hp - 1;      // 横から当たった：HP を減らす（★ player.js の値を書き換える）
      player.hitTimer = HIT_TIME;     // しばらく当たらない
    }
  }
   enemies = enemies.filter((enemy) => enemy.alive);   // 生きている敵だけを残す
}

// ④ 描く：配列の敵を1体ずつ取り出して描く
function drawEnemies() {
  ctx.fillStyle = "#ff6b6b";
  for (const enemy of enemies) {
    ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
  }
  ctx.fillStyle = "#e8eeff";
  ctx.fillText("敵 = " + enemies.length, 10, 40);
}