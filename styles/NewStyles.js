import { StyleSheet, Platform, Dimensions } from "react-native";
import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor5, themeColor6, themeColor7, themeColor10, themeColor11, themeColor2, } from "../theme/Color";

export const { width: deviceWidth, height: deviceHeight } = Dimensions.get("window");
export const CELL_SIZE = 45;
export const CELL_BORDER_RADIUS = Platform.OS === "ios" ? 8 : 0;
export const DEFAULT_CELL_BG_COLOR = themeColor1.bgColor(1);
export const NOT_EMPTY_CELL_BG_COLOR = themeColor0.bgColor(1);
export const ACTIVE_CELL_BG_COLOR = themeColor1.bgColor(1);

export const gradientColors = [
  themeColor0.bgColor(1),
  themeColor0.bgColor(0.7),
  themeColor0.bgColor(0.5),
  themeColor0.bgColor(0.2),
  themeColor1.bgColor(0.2),
  themeColor1.bgColor(0.5),
  themeColor1.bgColor(0.8),
  themeColor1.bgColor(1),
];

const NewStyles = StyleSheet.create({
  codeFieldRoot: {
    height: 45,
    paddingHorizontal: 20,
    justifyContent: "center",
  },

  cell: {
    marginHorizontal: 8,
    height: 45,
    width: 45,
    lineHeight: 45 - 5,
    borderBottomColor: themeColor0.bgColor(1),
    borderBottomWidth: StyleSheet.hairlineWidth,
    ...Platform.select({ web: { lineHeight: 65 } }),
    fontSize: 24,
    textAlign: "center",
    borderRadius: 8,
    borderCurve: "continuous",
    overflow: "hidden",
    color: themeColor0.bgColor(1),
    backgroundColor: "#fff",
  },

  container: {
    flex: 1,
    backgroundColor: themeColor5.bgColor(1),
  },

  center: {
    alignItems: "center",
    justifyContent: "center",
  },

  rowWrapper: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },

  shadow: {
    shadowColor: themeColor0.bgColor(0.5),
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },

  border5: {
    borderRadius: 5,
    borderCurve: "continuous",
    overflow: "hidden",
  },

  border10: {
    borderRadius: 10,
    borderCurve: "continuous",
    overflow: "hidden",
  },

  border20: {
    borderRadius: 20,
    borderCurve: "continuous",
    overflow: "hidden",
  },

  border100: {
    borderRadius: 100,
    borderCurve: "continuous", 
  },

  text: {
    fontFamily: "VazirLight",
    color: themeColor0.bgColor(1),
    textAlign: 'right',
  },

  text1: {
    fontFamily: "VazirLight",
    color: themeColor1.bgColor(1),
    textAlign: 'right',
  },
  text2: {
    fontFamily: "VazirLight",
    color: themeColor2.bgColor(1),
    textAlign: 'right',
  },

  text3: {
    fontFamily: "VazirLight",
    color: themeColor3.bgColor(1),
    textAlign: 'right',
  },

  text4: {
    fontFamily: "VazirLight",
    color: themeColor4.bgColor(1),
    textAlign: 'right',
  },

  text6: {
    fontFamily: "VazirLight",
    color: themeColor6.bgColor(1),
    textAlign: 'right',
  },

  text7: {
    fontFamily: "VazirLight",
    color: themeColor7.bgColor(1),
    textAlign: 'right',
  },

  text10: {
    fontFamily: "VazirLight",
    color: themeColor10.bgColor(1),
    textAlign: 'right',
  },
  text11: {
    fontFamily: "VazirLight",
    color: themeColor11.bgColor(1),
    textAlign: 'right',
  },

  title: {
    fontSize: 16,
    fontFamily: "VazirBold",
    color: themeColor0.bgColor(1),
    textAlign: 'right',
  },
  title1: {
    fontSize: 16,
    fontFamily: "VazirBold",
    color: themeColor1.bgColor(1),
    textAlign: 'right',
  },

  title3: {
    fontSize: 16,
    fontFamily: "VazirBold",
    color: themeColor3.bgColor(1),
    textAlign: 'right',
  },

  title4: {
    fontSize: 16,
    fontFamily: "VazirBold",
    color: themeColor4.bgColor(1),
    textAlign: 'right',
  },

  title6: {
    fontSize: 16,
    fontFamily: "VazirBold",
    color: themeColor6.bgColor(1),
    textAlign: 'right',
  },

  title7: {
    fontSize: 16,
    fontFamily: "VazirBold",
    color: themeColor7.bgColor(1),
    textAlign: 'right',
  },

  title10: {
    fontSize: 16,
    fontFamily: "VazirBold",
    color: themeColor10.bgColor(1),
    textAlign: 'right',
  },

  heading: {
    fontSize: 20,
    fontFamily: "VazirBold",
    color: themeColor0.bgColor(1),
    textAlign: 'right',
  },

  heading3: {
    fontSize: 20,
    fontFamily: "VazirBold",
    color: themeColor3.bgColor(1),
    textAlign: 'right',
  },

  heading4: {
    fontSize: 20,
    fontFamily: "VazirBold",
    color: themeColor4.bgColor(1),
    textAlign: 'right',
  },

  heading10: {
    fontSize: 20,
    fontFamily: "VazirBold",
    color: themeColor10.bgColor(1),
    textAlign: 'right',
  },

  discountText: {
    fontSize: 11,
    fontFamily: "VazirLight",
    color: themeColor3.bgColor(1),
    textDecorationLine: "line-through",
    textAlign: 'right',
  },

  textInput: {
    minHeight: 50,
    backgroundColor: themeColor3.bgColor(0.2),
    paddingHorizontal: 15,
  },
});

export default NewStyles;
