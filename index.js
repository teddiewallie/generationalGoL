g = {
  grid: null,
  canvas: null,
  interval: null,
  ms: 100,
  pixel: {
    old: 2,
    dead: 4
  },
  colors: {
    alive: '#000',
    dead: '#fff',
    old: '#f00'
  },
  props: {
    size: 10,
    rows: 90,
    cols: 60
  }
};

window.onload = () => {
  g.grid = newGrid();

  g.canvas = newCanvas();
  refreshCanvas();

  document.body.appendChild(g.canvas);

  const buttonRow = document.createElement('div');
  document.body.appendChild(buttonRow);
  buttonRow.appendChild(newNextButton());
  buttonRow.appendChild(newPlayPauseButton());
  buttonRow.appendChild(newRandomButton());
  
  buttonRow.appendChild(newOldInput());
  buttonRow.appendChild(newDeadInput());
};

const canvasClickEvent = (row, col) => {
  const pixel = g.grid[row][col];
  pixel.isAlive = !pixel.isAlive;

  refreshCanvas();
};

const newCanvas = () => {
  if (g.canvas !== null) { return; };

  canvas = document.createElement('canvas');
  canvas.width = g.props.rows * g.props.size;
  canvas.height = g.props.cols * g.props.size;

  canvas.addEventListener('click', (e) => {
    canvasClickEvent(
      Math.ceil(e.clientX / g.props.size) - 1,
      Math.ceil(e.clientY / g.props.size) - 5
    );
  }, false);

  return canvas;
};

const newGrid = () => {0
  const grid = new Array();

  for (let row = 0; row < g.props.rows; row++) {
    for (let col = 0; col < g.props.cols; col++) {
      col === 0 && (grid[row] = new Array());
      grid[row][col] = {
        generation: 0,
        isAlive: false,
        willLive: false
      };
    }
  }

  return grid;
};

const refreshCanvas = () => {
  const context = g.canvas.getContext('2d');

  for (let row = 0; row < g.props.rows; row++) {
    for (let col = 0; col < g.props.cols; col++) {
      const pixel = g.grid[row][col];
      let color = g.colors.dead;

      if (pixel.generation > g.pixel.old) {
        color = g.colors.old;
      } else {
        color = g.grid[row][col].isAlive
          ? g.colors.alive
          : g.colors.dead;
      }

      context.fillStyle = color;

      context.fillRect(
        row * g.props.size,
        col * g.props.size,
        g.props.size,
        g.props.size
      );
    }
  }
};

const newOldInput = () => {
  const span = document.createElement('span');
  span.innerText = 'Old: ';
  const input = document.createElement('input');
  input.value = g.pixel.old;
  input.addEventListener('change', () => {
    if (typeof Number(input.value) === 'number') {
      g.pixel.old = Number(input.value);
    }
  }, false);
  span.appendChild(input);
  return span;
};

const newDeadInput = () => {
  const span = document.createElement('span');
  span.innerText = 'Dead: ';
  const input = document.createElement('input');
  input.value = g.pixel.dead;
  input.addEventListener('change', () => {
    if (typeof Number(input.value) === 'number') {
      g.pixel.dead = Number(input.value);
    }
  });
  span.appendChild(input);
  return span;
};

const newNextButton = () => {
  const button = document.createElement('button');
  button.innerText = '⏭';
  button.addEventListener('click', () => {
    nextFrame();
  }, false);
  return button;
};

const newPlayPauseButton = () => {
  const button = document.createElement('button');
  button.innerText = '⏯';
  button.addEventListener('click', () => {
    if (g.interval === null) {
      g.interval = setInterval(nextFrame, g.ms);
    } else {
      clearInterval(g.interval);
      g.interval = null;
    }
  }, false);
  return button;
};

const newRandomButton = () => {
  const button = document.createElement('button');
  button.innerText = 'Random';
  button.addEventListener('click', () => {
    for (let row = 0; row < g.props.rows; row++) {
      for (let col = 0; col < g.props.cols; col++) {
        g.grid[row][col].isAlive = (Math.random() >= 0.5) ? 1 : 0;
      }
    }

    refreshCanvas();
  }, false);
  return button;
};

const countLivingNeighbors = (row, col) => {
  let alive = 0;

  for (let offRow = -1; offRow < 2; offRow++) {
    for (let offCol = -1; offCol < 2; offCol++) {

      if (offRow === 0 && offCol == 0) {
        continue;
      }

      try {
        const isAlive = g.grid[row + offRow][col + offCol].isAlive;
        isAlive && alive++;
      } catch (e) {
        // meh
      }
    }
  }

  return alive;
};

const nextFrame = () => {
  for (row = 0; row < g.props.rows; row++) {
    for (col = 0; col < g.props.cols; col++) {
      const living = countLivingNeighbors(row, col); 
      const pixel = g.grid[row][col];

      pixel.isAlive && pixel.generation++;
      !pixel.isAlive && (pixel.generation = 0);

      if (living == 2) {
        pixel.willLive = pixel.isAlive;
      } else if (living === 3) {
        pixel.willLive = true;
      } else {
        pixel.willLive = false;
      }

      if (pixel.generation > g.pixel.dead) {
        pixel.willLive = false;
      }
    }
  }

  for (row = 0; row < g.props.rows; row++) {
    for (col = 0; col < g.props.cols; col++) {
      g.grid[row][col].isAlive = g.grid[row][col].willLive;
    }
  }

  refreshCanvas();
};
