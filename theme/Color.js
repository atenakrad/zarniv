const palate = [
  {
    //yellow
    color: "#BE8E5D",
    bgColor: (opacity) => `rgba(190, 142, 93, ${opacity})`,
  },
  {
    //dark background
    color: "#002349",
    bgColor: (opacity) => `rgba(0, 35, 73, ${opacity})`,
  },
  {
    //blue
    color: "#082D81",
    bgColor: (opacity) => `rgba(8, 45, 129, ${opacity})`,
  },
  {
    //gray
    color: "#999999",
    bgColor: (opacity) => `rgba(153, 153, 153, ${opacity})`,
  },
  {
    //white
    color: "#FFFFFF",
    bgColor: (opacity) => `rgba(255, 255, 255, ${opacity})`,
  },
  {
    //light background
    color: "#FAF9F7",
    bgColor: (opacity) => `rgba(250, 249, 247, ${opacity})`,
  },
  {
    //red
    color: "#D12929",
    bgColor: (opacity) => `rgba(209, 41, 41, ${opacity})`,
  },
  {
    //green
    color: "#00cc66",
    bgColor: (opacity) => `rgba(0, 204, 102, ${opacity})`,
  },
  {
    //blue
    color: "#6495ED",
    bgColor: (opacity) => `rgba(100, 149, 237, ${opacity})`,
  },
  {
    //purple
    color: "#6C3BAA",
    bgColor: (opacity) => `rgba(108, 59, 170, ${opacity})`,
  },
  {
    //black
    color: "#000000",
    bgColor: (opacity) => `rgba(0, 0, 0, ${opacity})`,
  },
  {
    //orange
    color: "#ee8a00",
    bgColor: (opacity) => `rgba(238, 138, 0, ${opacity})`,
  },
  {
    //dark gray
    color: "#f1eee4",
    bgColor: (opacity) => `rgba(241, 238, 228, ${opacity})`,
  },
];

export const themeColor0 = {
  //neon yellow
  ...palate[0],
};

export const themeColor1 = {
  //dark gray
  ...palate[1],
};

export const themeColor2 = {
  //mid gray
  ...palate[2],
};

export const themeColor3 = {
  //gray
  ...palate[3],
};

export const themeColor4 = {
  //white
  ...palate[4],
};

export const themeColor5 = {
  //background white
  ...palate[5],
};

export const themeColor6 = {
  //red
  ...palate[6],
};

export const themeColor7 = {
  //green
  ...palate[7],
};

export const themeColor8 = {
  //blue
  ...palate[8],
};

export const themeColor9 = {
  //purple
  ...palate[9],
};

export const themeColor10 = {
  //black
  ...palate[10],
};

export const themeColor11 = {
  //orange
  ...palate[11],
};

export const themeColor12 = {
  //dark gray
  ...palate[12],
};
