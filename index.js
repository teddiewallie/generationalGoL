g = {
  grid: null,
  canvas: null,
  interval: null,
  ms: 40,
  pixel: {
    old: 1,
    dead: 3
  },
  colors: {
    alive: '#000',
    dead: '#fff',
    old: '#f00'
  },
  props: {
    size: 6,
    rows: 150,
    cols: 100
  }
};

window.onload = () => {
  g.grid = newGrid();

  g.canvas = newCanvas();
  refreshCanvas();

  document.body.appendChild(canvas);
  document.body.appendChild(newNextButton());
  document.body.appendChild(newPlayPauseButton());
  document.body.appendChild(newRandomButton());
  
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
      Math.floor(e.clientX / g.props.size),
      Math.floor(e.clientY / g.props.size)
    );
  }, false);

  return canvas;
};

const newGrid = () => {
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

const newNextButton = () => {
  const button = document.createElement('button');
  button.innerText = '>>';
  button.addEventListener('click', () => {
    nextFrame();
  }, false);
  return button;
};

const newPlayPauseButton = () => {
  const button = document.createElement('button');
  button.innerText = '>||';
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
